# Lesson 24: A Fact That Lives in Its Own Table

*(A second SQLite table, `FOREIGN KEY`, `INNER JOIN`)*

**User Story**
> As a user, I want to record which supplier each item came from, and a
> serial number — without retyping a supplier's name differently every
> time.

**What you will build**
Every field this project has stored so far lives directly on one
`InventoryItem` row. `Supplier` is different: many items can share the
same supplier, and typing `"Acme Tools"` into a plain text field (the
same trap `enum Category` was built to avoid, back in Lesson 12) would
let `"Acme Tools"`, `"acme tools"`, and `"Acme Tools Inc."` all quietly
mean the same real supplier without the database ever knowing it. This
lesson gives suppliers their own table, connects `Items` to it with a
real `FOREIGN KEY`, and reads both together with a real `INNER JOIN` —
Epic 6's opening move, and this project's first genuinely relational
data.

**What you need to know first:** Lesson 9/10: `CREATE TABLE`,
`SELECT`/`SqliteDataReader`. Lesson 12: why a fixed set of values beats
free text. Lesson 23: `InventoryViewModel`.

**Terms introduced in this lesson:**
- **Foreign key** — a column in one table whose values must match a real
  row's key in another table (or be otherwise disallowed), the
  mechanism a relational database uses to enforce that a reference is
  never dangling.
- **`FOREIGN KEY ... REFERENCES`** — the SQL clause declaring one.
- **Referential integrity** — the guarantee a foreign key provides: no
  row can ever point at a supplier that doesn't exist.
- **`INNER JOIN`** — a SQL query combining rows from two tables based on
  a matching condition, producing one result row per match.
- **`SelectedValue`/`SelectedValuePath`** — a second way to bind a
  `ComboBox`'s selection, to one specific *property* of the selected
  item (here, a `Supplier`'s `Id`) instead of the whole object
  `SelectedItem` gives you.

**Objects and methods used**
- **`ComboBox.SelectedValue` / `SelectedValuePath`**
  - *What they are:* a second way to bind a `ComboBox`'s selection, to
    one specific *property* of the selected item instead of the whole
    object `SelectedItem` (Lesson 12) gives you.
  - *Implementation:* `SelectedValuePath` names which property of each
    bound item to treat as its "value" (here, a `Supplier`'s `Id`);
    `SelectedValue` then reads (or, `TwoWay`-bound, writes) that
    specific value directly, rather than the whole `Supplier` object.
  - *Its use:* the Supplier dropdown reads/writes a plain `SupplierId`
    integer — the real foreign key column — without the ViewModel ever
    needing to hold a full `Supplier` object just to know which one was
    picked.
- **`SqliteException`**
  - *What it is:* the real, library-authored exception type
    `Microsoft.Data.Sqlite` throws for a database-level failure —
    distinguishable from a generic `Exception`, per
    `Lesson-23-a-custom-exceptions.md`'s own general mechanism.
  - *Implementation:* `Microsoft.Data.Sqlite.SqliteException`, carrying
    a real `SqliteErrorCode` alongside the inherited `Message`.
  - *Its use:* `catch (SqliteException ex)` — this lesson's real, first
    place code depends on someone else's custom exception type, to
    catch and report a real foreign-key-violation error (`SQLite Error
    19`) distinctly from any other kind of failure.

`FOREIGN KEY`/`INNER JOIN` are SQL syntax, not C# classes or methods —
this lesson's own subject, given full treatment above in Terms
Introduced and in the Concept Unit below.

**Everything else in the file, not this lesson's subject but still
explained**
- **`ComboBox` / `SelectedItem`**
  - *What they are:* a dropdown restricted to one choice, and the
    property holding whichever item is currently selected.
  - *Implementation:* full treatment already given in
    `Lesson-12-enums-and-combobox.md` and
    `Lesson-08-selecteditem-and-two-way-binding.md`.
  - *Its use:* the Supplier dropdown itself, alongside its new
    `SelectedValue`/`SelectedValuePath` binding.
- **`SqliteCommand`**
  - *What it is:* one SQL statement, tied to a specific open
    connection.
  - *Implementation:* full treatment already given in
    `Lesson-09-sqlite-and-microsoft-data-sqlite.md`.
  - *Its use:* the real `CREATE TABLE Suppliers`/`INNER JOIN` queries
    this lesson adds, built the same way as every prior SQL command.

---

## Concept Unit: `FOREIGN KEY` and `INNER JOIN`

### The Problem

Two tables, `Suppliers` and `Items`, need to be connected — every item
belongs to exactly one supplier, but a supplier's real information
(name, and later, contact details) should exist in exactly one place,
not copied onto every item that uses it.

### Introduce the Concept in Isolation
```bash
dotnet new console -o lab-foreignkey
cd lab-foreignkey
dotnet add package Microsoft.Data.Sqlite
```

Replace `Program.cs`:

```csharp
using Microsoft.Data.Sqlite;

using SqliteConnection connection = new SqliteConnection("Data Source=lab.db");
connection.Open();

using (SqliteCommand checkPragma = connection.CreateCommand())
{
    checkPragma.CommandText = "PRAGMA foreign_keys";
    Console.WriteLine($"Default foreign_keys pragma on this connection: {checkPragma.ExecuteScalar()}");
}

using (SqliteCommand createSuppliers = connection.CreateCommand())
{
    createSuppliers.CommandText = "CREATE TABLE IF NOT EXISTS Suppliers (Id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL)";
    createSuppliers.ExecuteNonQuery();
}

using (SqliteCommand createItems = connection.CreateCommand())
{
    createItems.CommandText = "CREATE TABLE IF NOT EXISTS Items (Id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL, SupplierId INTEGER NOT NULL, FOREIGN KEY (SupplierId) REFERENCES Suppliers(Id))";
    createItems.ExecuteNonQuery();
}

using (SqliteCommand insertSupplier = connection.CreateCommand())
{
    insertSupplier.CommandText = "INSERT INTO Suppliers (Name) VALUES ('Acme Tools')";
    insertSupplier.ExecuteNonQuery();
}

long supplierId;
using (SqliteCommand idQuery = connection.CreateCommand())
{
    idQuery.CommandText = "SELECT last_insert_rowid()";
    supplierId = (long)idQuery.ExecuteScalar()!;
}
Console.WriteLine($"Supplier Id: {supplierId}");

using (SqliteCommand insertItem = connection.CreateCommand())
{
    insertItem.CommandText = "INSERT INTO Items (Name, SupplierId) VALUES (@name, @supplierId)";
    insertItem.Parameters.AddWithValue("@name", "Hex Bolts");
    insertItem.Parameters.AddWithValue("@supplierId", supplierId);
    insertItem.ExecuteNonQuery();
}
Console.WriteLine("Inserted item referencing a real supplier: OK");

try
{
    using SqliteCommand badInsert = connection.CreateCommand();
    badInsert.CommandText = "INSERT INTO Items (Name, SupplierId) VALUES (@name, @supplierId)";
    badInsert.Parameters.AddWithValue("@name", "Ghost Item");
    badInsert.Parameters.AddWithValue("@supplierId", 9999);
    badInsert.ExecuteNonQuery();
}
catch (SqliteException ex)
{
    Console.WriteLine($"Real error inserting an item with a fake SupplierId: {ex.SqliteErrorCode} {ex.Message}");
}

Console.WriteLine("INNER JOIN result:");
using (SqliteCommand join = connection.CreateCommand())
{
    join.CommandText = @"
        SELECT Items.Name, Suppliers.Name
        FROM Items
        INNER JOIN Suppliers ON Items.SupplierId = Suppliers.Id";
    using SqliteDataReader reader = join.ExecuteReader();
    while (reader.Read())
    {
        Console.WriteLine($"  {reader.GetString(0)} <- supplied by {reader.GetString(1)}");
    }
}
```

Run it:

```bash
dotnet run
```

Real output:

```text
Default foreign_keys pragma on this connection: 1
Supplier Id: 1
Inserted item referencing a real supplier: OK
Real error inserting an item with a fake SupplierId: 19 SQLite Error 19: 'FOREIGN KEY constraint failed'.
INNER JOIN result:
  Hex Bolts <- supplied by Acme Tools
```

#### Execution Trace

1. The `PRAGMA foreign_keys` query reports `1` before anything else
   runs — confirming enforcement is already active on this connection.
2. `INSERT` on `Suppliers` succeeds; `SELECT last_insert_rowid()` reads
   back its real `Id` (`1`), printed as `Supplier Id: 1`.
3. `INSERT` on `Items` with `SupplierId` bound to that same `1` succeeds
   — a real, existing supplier — printed as `Inserted item referencing
   a real supplier: OK`.
4. A second `INSERT` on `Items`, `SupplierId` bound to `9999` (no such
   supplier exists), is attempted inside a `try` block — SQLite's own
   foreign key check rejects it before the row is ever written, throwing
   a real `SqliteException`, caught and printed with its real error code
   and message.
5. The final `INNER JOIN`'s `foreach` (via `reader.Read()`) visits
   exactly one row — the one successful item from step 3 — printing
   `Hex Bolts <- supplied by Acme Tools`; the rejected `"Ghost Item"`
   from step 4 was never actually written, so it never appears here
   either.

*What this proves:* `PRAGMA foreign_keys` reports `1` (on) with zero
setup code — worth confirming directly rather than assuming: raw SQLite
itself defaults foreign key enforcement *off* unless a connection turns
it on explicitly, but `Microsoft.Data.Sqlite` (this project's own
provider, since Lesson 9) enables it automatically on every connection
it opens, a genuine, provider-specific difference from SQLite's own
general documentation. `FOREIGN KEY (SupplierId) REFERENCES Suppliers(Id)`
is what makes the second `INSERT` — `SupplierId = 9999`, a value that
matches no real `Suppliers.Id` — fail with a real, specific error instead
of silently succeeding with a dangling reference. `INNER JOIN` then reads
both tables together in one query: `Items.Name` and `Suppliers.Name`,
matched by `Items.SupplierId = Suppliers.Id`, producing one combined row
per match — `"Hex Bolts"` paired with its real supplier's actual name,
never duplicated or hand-typed into `Items` itself.

### Discard the Throwaway Example
Delete the `lab-foreignkey` folder. `FOREIGN KEY`/`INNER JOIN` are not
discarded — the real `Suppliers` table and `Items.SupplierId` use exactly
this next.

### Mechanical Walkthrough

- `FOREIGN KEY (SupplierId) REFERENCES Suppliers(Id)` — **first
  appearance.** Declares that every `Items.SupplierId` value must match a
  real `Id` already present in `Suppliers` — enforced by SQLite itself,
  the same "the database is a second, independent layer of protection"
  idea Lesson 9's `NOT NULL` already established, now for relationships
  instead of a single column's presence.
- The real `SqliteException` (reporting `SQLite Error 19`) — first
  appearance of a foreign key violation. Proof, not assertion, that referential
  integrity is genuinely enforced: `9999` doesn't exist in `Suppliers`,
  and the database itself refused the insert rather than silently
  accepting a reference to nothing.
- `INNER JOIN Suppliers ON Items.SupplierId = Suppliers.Id` — **first
  appearance of `JOIN`.** `ON` names the matching condition; only rows
  where that condition holds appear in the result — an item whose
  `SupplierId` matched no supplier (impossible here, thanks to the
  foreign key, but true in general for `INNER JOIN`) would simply be
  excluded from the result entirely.

### CS Lens

A foreign key is **referential integrity**, enforced structurally rather
than by convention — the same category of guarantee `NOT NULL`,
`decimal`'s exactness, and `Nullable<T>`'s honest absence have each
represented at different points in this project: making an entire class
of bug (a reference to something that was never real) structurally
impossible, instead of something every piece of code that touches
`SupplierId` has to remember to check by hand.

### SE Lens

Why store `SupplierId` (a number) on `Items` at all, instead of just
storing the supplier's name directly, the way `Category` still stores
its member name as text (Lesson 12)? Because `Category`'s five values are
fixed at compile time, defined once in C# and never added to by a user;
suppliers are exactly the opposite — a real, growing, user-managed list
that can't be baked into an `enum`. A foreign key is the relational
answer to "a fixed set of choices, but the set itself can grow" — `enum`
handles compile-time-fixed sets; a real, separate table with a foreign
key handles run-time-growing ones.

### Connection

The real `Suppliers` table and `Items.SupplierId` are built exactly this
way next.

---

## Concept Unit: Growing the Schema — Suppliers, `SupplierId`, and `SerialNumber`

### The Problem

`InventoryItem` needs two new facts: which supplier an item came from,
and its serial number — the second a plain, simple string, unlike the
first.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New `Supplier.cs`, `InventoryItem.cs`,
  `InventoryViewModel.cs`.
- **Change type:** Add.
- **Dependencies:** `FOREIGN KEY`, previous unit; the
  `INotifyPropertyChanged` property shape already established.

### The New Code — `Supplier.cs`

```csharp
namespace PocketInventory
{
    public class Supplier
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}
```

### The New Code — `InventoryItem` Growth

```csharp
private int supplierId;

public int SupplierId
{
    get { return supplierId; }
    set
    {
        supplierId = value;
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(SupplierId)));
    }
}

public string SupplierName { get; set; } = string.Empty;

private string serialNumber = string.Empty;

public string SerialNumber
{
    get { return serialNumber; }
    set
    {
        serialNumber = value;
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(SerialNumber)));
    }
}
```

### The New Code — the Table Shape

```csharp
command.CommandText = "CREATE TABLE IF NOT EXISTS Suppliers (Id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL)";
command.ExecuteNonQuery();

command.CommandText = "INSERT OR IGNORE INTO Suppliers (Id, Name) VALUES (1, 'Acme Tools'), (2, 'Global Hardware'), (3, 'Unknown Supplier')";
command.ExecuteNonQuery();

command.CommandText = "CREATE TABLE IF NOT EXISTS Items (Id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL, Category TEXT NOT NULL, Location TEXT NOT NULL, Value TEXT NOT NULL, PurchaseDate TEXT NULL, Notes TEXT NOT NULL, IsFavorite INTEGER NOT NULL, SupplierId INTEGER NOT NULL DEFAULT 3, SerialNumber TEXT NOT NULL, FOREIGN KEY (SupplierId) REFERENCES Suppliers(Id))";
command.ExecuteNonQuery();
```

### Mechanical Walkthrough

- `public string SupplierName { get; set; } = string.Empty;` — **first
  property on `InventoryItem` with no `PropertyChanged?.Invoke(...)` in
  its `set`.** Every other property announces its own changes because
  binding to it needs live updates; `SupplierName` is only ever *written*
  once, by the loading code itself, right after a `JOIN` reads it — never
  edited through a binding, so it doesn't need the full pattern the
  editable fields all share.
- `INSERT OR IGNORE INTO Suppliers (Id, Name) VALUES (1, 'Acme Tools'), ...`
  — (first appearance of `INSERT OR IGNORE` and multi-row `VALUES`) —
  seeds three real suppliers the first time this runs; `OR IGNORE` means
  a second run (the app reopening) silently does nothing instead of
  failing on the now-existing rows — the identical idempotent-on-purpose
  reasoning Lesson 9's `CREATE TABLE IF NOT EXISTS` already established,
  applied to seed data instead of schema.
- `SupplierId INTEGER NOT NULL DEFAULT 3` — (first appearance of a column
  `DEFAULT`) — every item created before this lesson (none exist yet in
  a fresh database, but worth naming for a database upgraded from an
  earlier version) would need a real `SupplierId`; `DEFAULT 3` points
  at the seeded `"Unknown Supplier"` row rather than leaving it blank or
  breaking the `NOT NULL` constraint.

### CS Lens

`SupplierName` living on `InventoryItem` without its own live-updating
`set` is a deliberate, small break from an otherwise consistent pattern —
worth naming rather than leaving as an unexplained exception: not every
property needs the full `INotifyPropertyChanged` machinery, only the ones
a user can actually change through the UI. `SupplierId` is; the
human-readable `SupplierName` computed from it, once, at load time, is
not.

### SE Lens

Why seed exactly three suppliers, including a literal `"Unknown Supplier"`,
instead of starting with an empty `Suppliers` table? Because
`Items.SupplierId` is `NOT NULL` — every item, including ones a user adds
before ever touching supplier management, needs *some* valid value. An
empty `Suppliers` table would make the very first `INSERT` on `Items`
fail immediately, since no `SupplierId` could satisfy the foreign key —
seeding a real, honest "Unknown Supplier" row gives new items a safe,
truthful default rather than forcing a user to invent supplier data
before they're ready to.

### Connection

The Add row and `DetailPanel` show the new `Supplier` dropdown and
`SerialNumber` field next.

---

## Concept Unit: `SelectedValue`/`SelectedValuePath` — Binding to a Property, Not the Whole Object

### The Problem

`Category`'s `ComboBox` (Lesson 12) binds `SelectedItem` directly to a
`Category` value, because `NewItemDraft.Category` *is* a `Category`.
`NewItemDraft.SupplierId` is an `int` — the whole `Supplier` object isn't
what needs to be stored, just its `Id`.

### Introduce the Concept in Isolation
```bash
dotnet new wpf -o lab-selectedvalue
```

Replace `MainWindow.xaml`'s `Grid` contents:

```xml
<StackPanel Loaded="StackPanel_Loaded">
    <ComboBox x:Name="SupplierBox"
              ItemsSource="{Binding Suppliers}"
              DisplayMemberPath="Name"
              SelectedValuePath="Id"
              SelectedValue="{Binding SelectedSupplierId}" />
</StackPanel>
```

Replace `MainWindow.xaml.cs`'s contents:

```csharp
using System.Collections.ObjectModel;
using System.Windows;

namespace lab_selectedvalue
{
    public class Supplier
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public partial class MainWindow : Window
    {
        public ObservableCollection<Supplier> Suppliers { get; } = new ObservableCollection<Supplier>
        {
            new Supplier { Id = 1, Name = "Acme Tools" },
            new Supplier { Id = 2, Name = "Global Hardware" }
        };

        public int SelectedSupplierId { get; set; }

        public MainWindow()
        {
            InitializeComponent();
            SelectedSupplierId = 2;
            DataContext = this;
        }

        private void StackPanel_Loaded(object sender, RoutedEventArgs e)
        {
            Console.WriteLine($"SelectedSupplierId set to 2 before binding resolved; SupplierBox.SelectedItem: {(SupplierBox.SelectedItem as Supplier)?.Name}");

            SupplierBox.SelectedValue = 1;
            Console.WriteLine($"After setting SupplierBox.SelectedValue = 1, SelectedSupplierId = {SelectedSupplierId}");
            Console.WriteLine($"SupplierBox.SelectedItem now: {(SupplierBox.SelectedItem as Supplier)?.Name}");
        }
    }
}
```

Run it on your Windows machine:

```bash
dotnet run
```

Real output:

```text
SelectedSupplierId set to 2 before binding resolved; SupplierBox.SelectedItem: Global Hardware
After setting SupplierBox.SelectedValue = 1, SelectedSupplierId = 1
SupplierBox.SelectedItem now: Acme Tools
```

*What this proves:* setting `SelectedSupplierId = 2` (a plain `int`,
before the window even loads) correctly pre-selects the *whole*
`Supplier` object whose `Id` is `2` — `SelectedValuePath="Id"` is what
lets `SelectedValue` map between "the `int` this project actually stores"
and "the object the `ComboBox` actually displays," in both directions.
Setting `SupplierBox.SelectedValue = 1` directly (simulating a user
picking a different supplier) correctly writes `1` back into
`SelectedSupplierId` — the binding is genuinely two-way, and
`SelectedItem` updates to match, confirming both properties stay in sync
through the same underlying selection.

### Discard the Throwaway Example
Delete the `lab-selectedvalue` folder. `SelectedValue`/`SelectedValuePath`
are not discarded — the real Supplier `ComboBox` uses exactly this next.

### Mechanical Walkthrough

- `DisplayMemberPath="Name"` — reappearing (Lesson 7's `ItemListBox`),
  controls what text each dropdown entry shows.
- `SelectedValuePath="Id"` — **first appearance.** Names which property
  of the selected item `SelectedValue` actually reads and writes —
  without it, `SelectedValue` would just be the whole selected object,
  identical to `SelectedItem`.
- `SelectedValue="{Binding SelectedSupplierId}"` — **first appearance of
  `SelectedValue`** bound (as opposed to `SelectedItem`, used for
  `Category` in Lesson 12). Two-way by default, exactly like every other
  binding in this project — reads `SelectedSupplierId` to pick the
  initial selection, writes back to it the instant the selection changes.

### CS Lens

`SelectedValue`/`SelectedValuePath` is WPF's own small **projection** —
extracting one property (`Id`) from a larger object (`Supplier`) for
binding purposes, the same underlying idea as reading `item.Category`
instead of the whole `InventoryItem` when only one fact is needed. The
`ComboBox` itself still displays and manages full `Supplier` objects
internally; only the *bound value* on the C# side is narrowed to the one
property that matters for storage.

### SE Lens

Why not just give `InventoryItem` a `Supplier Supplier { get; set; }`
property — the whole object — instead of a bare `SupplierId` `int`, and
bind `SelectedItem` the simple way `Category` already does? Because
`Supplier` objects come from a real, separate table that can change
independently — holding a reference to one specific in-memory `Supplier`
object risks it going stale the moment that table is reloaded or a
supplier is renamed elsewhere. Storing just the `Id` (the foreign key
itself, mirroring exactly what the database actually persists) keeps
`InventoryItem` honest about what it really owns: a reference, not a
copy of someone else's data.

### Connection

The real Add row's Supplier `ComboBox` uses exactly this binding shape
next.

---

## Concept Unit: Wiring Suppliers Into the Form and Loading With `JOIN`

### The Problem

`Supplier`, `SupplierId`, `SerialNumber`, `SelectedValue`/`SelectedValuePath`,
and `INNER JOIN` all exist independently; nothing connects them to the
real project yet.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryPage.xaml`, `InventoryViewModel.cs`.
- **Change type:** Add/Modify.
- **Dependencies:** Every unit in this lesson.

### The New Code — the Add Row

```xml
<ComboBox Width="150"
          Margin="12,0,0,0"
          ItemsSource="{Binding Suppliers}"
          DisplayMemberPath="Name"
          SelectedValuePath="Id"
          SelectedValue="{Binding NewItemDraft.SupplierId}" />
<TextBox Width="120"
         Margin="12,0,0,0"
         Text="{Binding NewItemDraft.SerialNumber, UpdateSourceTrigger=PropertyChanged}" />
```

### The New Code — the Detail Panel

```xml
<TextBlock Text="{Binding SupplierName}" Margin="0,8,0,0" />
<TextBlock Text="{Binding SerialNumber}" Margin="0,8,0,0" />
```

### The New Code — Saving and Updating

```csharp
command.CommandText = "INSERT INTO Items (Name, Category, Location, Value, PurchaseDate, Notes, IsFavorite, SupplierId, SerialNumber) VALUES (@name, @category, @location, @value, @purchaseDate, @notes, @isFavorite, @supplierId, @serialNumber)";
command.Parameters.AddWithValue("@supplierId", item.SupplierId);
command.Parameters.AddWithValue("@serialNumber", item.SerialNumber);
```

```csharp
command.CommandText = "UPDATE Items SET Name = @name, Category = @category, Location = @location, Value = @value, PurchaseDate = @purchaseDate, Notes = @notes, IsFavorite = @isFavorite, SupplierId = @supplierId, SerialNumber = @serialNumber WHERE Id = @id";
command.Parameters.AddWithValue("@supplierId", item.SupplierId);
command.Parameters.AddWithValue("@serialNumber", item.SerialNumber);
```

`SaveItemToDatabase` and `UpdateItemInDatabase` (Lessons 9/21) both grow
by exactly these two columns, alongside every parameter already there
since Lesson 15 — worth being explicit about, since it's easy to add a
new column to `CREATE TABLE` and the `SELECT` that loads it back (the
next unit) while quietly forgetting the two methods that *write* it are
just as real and just as much in need of updating.

### The New Code — Loading With `JOIN`

```csharp
command.CommandText = @"
    SELECT Items.Id, Items.Name, Items.Category, Items.Location, Items.Value,
           Items.PurchaseDate, Items.Notes, Items.IsFavorite, Items.SupplierId,
           Items.SerialNumber, Suppliers.Name
    FROM Items
    INNER JOIN Suppliers ON Items.SupplierId = Suppliers.Id";

using SqliteDataReader reader = command.ExecuteReader();
while (reader.Read())
{
    InventoryItem item = new InventoryItem
    {
        Id = reader.GetInt32(0),
        Name = reader.GetString(1),
        Category = Enum.Parse<Category>(reader.GetString(2)),
        Location = reader.GetString(3),
        Value = decimal.Parse(reader.GetString(4), CultureInfo.InvariantCulture),
        PurchaseDate = reader.IsDBNull(5) ? null : DateTime.Parse(reader.GetString(5)),
        Notes = reader.GetString(6),
        IsFavorite = reader.GetInt32(7) == 1,
        SupplierId = reader.GetInt32(8),
        SerialNumber = reader.GetString(9),
        SupplierName = reader.GetString(10)
    };
    loadedItems.Add(item);
}
```

### The New Code — the ViewModel's `Suppliers` List

```csharp
public ObservableCollection<Supplier> Suppliers { get; } = new ObservableCollection<Supplier>();

private List<Supplier> LoadSuppliersFromDatabase()
{
    List<Supplier> suppliers = new List<Supplier>();
    using SqliteConnection connection = new SqliteConnection(ConnectionString);
    connection.Open();
    using SqliteCommand command = connection.CreateCommand();
    command.CommandText = "SELECT Id, Name FROM Suppliers";
    using SqliteDataReader reader = command.ExecuteReader();
    while (reader.Read())
    {
        suppliers.Add(new Supplier { Id = reader.GetInt32(0), Name = reader.GetString(1) });
    }
    return suppliers;
}
```

`InventoryViewModel`'s constructor calls `LoadSuppliersFromDatabase()`
and populates `Suppliers` alongside its existing `Items` load, right
after `EnsureDatabaseCreated()`.

### Mechanical Walkthrough

- `SelectedValue="{Binding NewItemDraft.SupplierId}"` — reappearing
  exactly (this lesson's third unit), now bound to the real draft item.
- `SaveItemToDatabase`/`UpdateItemInDatabase` growing by `SupplierId`/
  `SerialNumber` — worth proving, not trusting: without this, saving a
  new item would hit `SerialNumber TEXT NOT NULL`'s own constraint
  directly, since the column would never appear in the `INSERT` at all
  — a real, verified `SqliteException` (`NOT NULL constraint failed:
  Items.SerialNumber`), not a hypothetical one. `SupplierId` alone
  wouldn't crash the same way (`DEFAULT 3` covers an omitted column),
  but would silently ignore whatever supplier a user actually chose,
  always saving `"Unknown Supplier"` instead — a save that succeeds
  while quietly discarding real input.
- `Text="{Binding SupplierName}"` in `DetailPanel` — reappearing
  (plain `{Binding}`, familiar since Lesson 8), read-only for the same
  reason `Category` and `Value` already are.
- The `JOIN`-based `SELECT`, ten columns instead of eight — reappearing
  `SELECT`/`SqliteDataReader` shape (Lesson 10), extended with two real
  columns from `Items` (`SupplierId`, `SerialNumber`) and one from the
  *joined* table (`Suppliers.Name`, read via `reader.GetString(10)` even
  though it was never a column on `Items` at all) — direct proof that a
  `JOIN`'s result set is genuinely one combined row, not two separate
  ones glued together after the fact.
- `LoadSuppliersFromDatabase()` — reappearing shape
  (`LoadItemsFromDatabase`, Lesson 10), applied to a second, independent
  table — `Suppliers` populates the `ComboBox`'s own list, entirely
  separate from `Items`' own load.

### CS Lens

Reading `Suppliers.Name` directly out of the `INNER JOIN`'s result set,
with no second query, no second round-trip to the database, is the
concrete payoff of relational data: one query, one connection round-trip,
both tables' relevant facts arrive together. Contrast this with the
alternative this project deliberately avoided — loading `Items` first,
then querying `Suppliers` once per item in a loop — the same "let the
database do the combining work it's built for" principle Lesson 30's
`SUM()` will apply to aggregation next.

### SE Lens

Why does `SupplierName` get populated once, at load time, via the
`JOIN`, rather than looked up live every time `DetailPanel` needs to
display it (searching `Suppliers` by `SupplierId` on demand)? Because
`DetailPanel` binds directly to properties on the currently selected
`InventoryItem` — it has no independent way to also reach into
`Suppliers` mid-binding. Computing `SupplierName` once, when the item is
loaded, and storing it directly on the object is the simplest way to make
it available exactly where `{Binding SupplierName}` expects to find it,
at the cost of it going stale if a supplier's name changes without the
app reloading — a real, honest tradeoff, acceptable here because supplier
renames aren't a feature this project builds.

### Commands Needed

```bash
dotnet run
```

### Run It

On your Windows machine: the Add row now shows a Supplier dropdown
(seeded with three real suppliers) and a serial number field. Add an
item, picking a supplier — `DetailPanel` shows that supplier's real name
and the serial number. Fully quit and reopen the app: the item, its
supplier, and its serial number are all still correct, `SupplierName`
freshly computed from a real `JOIN` each time the app loads.

### Connection

`Items` and `Suppliers` are now genuinely related tables, connected by a
real, enforced foreign key. The next lesson addresses a different kind of
data this project has started collecting but never handled carefully:
duplicating an item, and the real difference between copying a reference
and copying the actual data.

---

## Closing

### Connect the Pieces

A user picks a supplier from the new `ComboBox` — `SelectedValue="{Binding NewItemDraft.SupplierId}"`
(third unit, proven with real output showing both directions of the
binding) writes the chosen supplier's real `Id` into the draft item, not
the whole `Supplier` object. Saving persists that `SupplierId` alongside
every other field, protected by the real `FOREIGN KEY` constraint proven
in this lesson's first unit — a typo'd or fabricated `SupplierId` would
fail loudly, the same `SQLite Error 19` captured there. Reopening the app
calls the new `JOIN`-based `LoadItemsFromDatabase`, reading `Items` and
`Suppliers` together in one query and populating `SupplierName` directly,
which `DetailPanel`'s plain `{Binding SupplierName}` then displays with
no further lookup needed.

### What Breaks Without This

Temporarily change the loading `SELECT`'s `INNER JOIN` to a plain, comma-
based cross reference with no real join condition — `FROM Items, Suppliers`
instead of `FROM Items INNER JOIN Suppliers ON Items.SupplierId = Suppliers.Id`
— and rerun with at least one item and the three seeded suppliers
present. Real, representative failure: the app doesn't crash, but
`LoadItemsFromDatabase`'s `while (reader.Read())` loop runs far more
times than there are real items — once for *every combination* of an
item and a supplier (one item × three suppliers = three rows for a
single real item), because a `FROM` clause listing two tables with no
`ON` condition produces every possible pairing, not matched ones. This is
a real, classic relational mistake — dropping the join condition doesn't
error, it silently multiplies data. Restore the real `INNER JOIN ... ON`
clause afterward.

### Exercises

- In the `lab-foreignkey` throwaway pattern, add a second supplier and a
  second item referencing it, then extend the `INNER JOIN` query to also
  select `Suppliers.Id` — confirm real output showing each item correctly
  paired with its own, distinct supplier.
- Predict, in your own words, what `DELETE FROM Suppliers WHERE Id = 1`
  would do if a real item still references `SupplierId = 1`, given this
  lesson's `FOREIGN KEY` — then confirm your prediction in the
  `lab-foreignkey` project (with at least one item inserted against
  supplier `1` first).
- Add a fourth seeded supplier of your own choosing to
  `EnsureDatabaseCreated`'s `INSERT OR IGNORE` list, rerun the real app,
  and confirm it appears in the Supplier dropdown with zero other code
  changes.

### Definition of Done

- [ ] A real `Suppliers` table exists, seeded with at least three
      suppliers, connected to `Items` via a real, enforced
      `FOREIGN KEY`.
- [ ] The Add row includes a working Supplier dropdown (bound via
      `SelectedValue`/`SelectedValuePath`) and a serial number field.
- [ ] `DetailPanel` shows the selected item's real supplier name (via
      `JOIN`) and serial number.
- [ ] Adding an item, fully quitting, and reopening the app preserves its
      supplier and serial number correctly.
- [ ] You reproduced the missing-join-condition row-multiplication bug on
      purpose, confirmed it, and restored the real `INNER JOIN ... ON`
      clause.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add a real Suppliers table, FOREIGN KEY, and INNER JOIN — Epic 6 begins"`.
