# Lesson 21: The Same Form, Two Different Endings

*(Passing an existing object into a view; `UPDATE ... WHERE Id = @id`)*

**User Story**
> As a user, I want to select an item, edit its fields in the same form I
> use to add new items, and save my changes back to that exact item.

**What you will build**
Every field this project has added since Epic 3 — `Category`, `Value`,
`PurchaseDate`, `Notes`, `IsFavorite` — has been shown read-only in
`DetailPanel`, with a repeated, honest note in each lesson: editing it for
real belongs here. This lesson delivers on that: selecting a row now
pre-fills the Add form with that item's real values, and clicking Save
updates the existing database row instead of inserting a new one. Epic 5
begins with the smallest version of this idea — reuse, don't duplicate,
the same form for two different endings.

**What you need to know first:** Lesson 6: `InventoryItem`. Lesson 9/10:
`SaveItemToDatabase` (`INSERT`), `LoadItemsFromDatabase` (`SELECT`).
Lesson 16: `ItemsGrid_SelectionChanged`, `DetailPanel.DataContext`.
Lesson 12–15: every field this lesson finally makes genuinely editable.

**Terms introduced in this lesson:**
- **`UPDATE ... WHERE`** — the SQL statement that modifies existing rows
  matching a condition, instead of `INSERT`'s always-add-a-new-row
  behavior.
- **Rows affected** — the number `ExecuteNonQuery()` returns for an
  `UPDATE`/`DELETE`, telling you how many rows actually matched the
  `WHERE` clause, distinct from whether the command itself succeeded.

**Objects and methods used**
- `SqliteConnection`/`SqliteCommand`/`ExecuteNonQuery()` (Lesson 9)
  reappear here, already given full treatment — brief reminder only,
  per the Repetition Rule. `UPDATE ... WHERE` is this lesson's own
  subject, given full treatment below.

**`CultureInfo.InvariantCulture`**
- *What it is:* reappearing from Lesson 13's fifth unit — a fixed,
  non-regional culture that never changes no matter what machine runs
  this code.
- *Implementation:* Lesson 13's fifth unit gives this its full
  treatment (a `static` property on `System.Globalization.CultureInfo`);
  here it's the exact same value, reused unchanged, not re-derived.
- *Its use:* formats `item.Value` for this lesson's `UPDATE`'s `@value`
  parameter the identical way `SaveItemToDatabase`'s original `INSERT`
  already does — a value round-tripping through SQL needs a fixed,
  always-`.`-separated decimal format so it parses back correctly on
  any machine, regardless of that machine's own regional settings; that
  is a different problem from `ToString("C")`'s *display* formatting,
  which deliberately follows whichever culture is currently running.

**`DBNull.Value`**
- *What it is:* reappearing from Lesson 14's fifth unit — ADO.NET's own
  sentinel meaning "this specific database cell is genuinely empty,"
  distinct from C#'s own `null`.
- *Implementation:* Lesson 14's fifth unit gives this its full
  treatment, including why passing a bare C# `null` to
  `Parameters.AddWithValue` throws at runtime where `DBNull.Value`
  does not.
- *Its use:* inside `(object?)item.PurchaseDate?.ToString("O") ?? DBNull.Value`,
  exactly as first used in `SaveItemToDatabase` — when `PurchaseDate` is
  absent, this lesson's `UPDATE`'s `@purchaseDate` parameter has to
  write a real SQL `NULL`, not the four-character string `"null"` and
  not a C# `null` reference the driver would reject.

---

## Concept Unit: Loading an Existing Object's Values Into a Form

### The Problem

Selecting a row currently only updates `DetailPanel`'s read-only display.
Editing needs the Add form's own fields — `NameInput`,
`CategoryComboBox`, and the rest — populated with the selected item's
real values, without making the form *literally the same object* as the
row in the grid (editing the form, mid-thought, before clicking Save,
should not silently change what `ItemsGrid` shows).

### Introduce the Concept in Isolation
```bash
dotnet new console -o lab-loadform
cd lab-loadform
```

Replace `Program.cs`:

```csharp
Cat selected = new Cat { Name = "Whiskers" };

Cat draft = new Cat();
draft.Name = selected.Name;

Console.WriteLine($"Before edit: selected={selected.Name}, draft={draft.Name}");

draft.Name = "Whiskers Jr.";

Console.WriteLine($"After editing draft only: selected={selected.Name}, draft={draft.Name}");

class Cat
{
    public string Name { get; set; } = string.Empty;
}
```

Run it:

```bash
dotnet run
```

Real output:

```text
Before edit: selected=Whiskers, draft=Whiskers
After editing draft only: selected=Whiskers, draft=Whiskers Jr.
```

*What this proves:* `draft.Name = selected.Name;` copies the *value*
`"Whiskers"` into `draft`'s own field — `draft` and `selected` are two
genuinely separate objects from that point on, not two names for the same
one. Changing `draft.Name` afterward leaves `selected.Name` completely
untouched — real proof that a field-by-field copy, unlike
`draft = selected;` (which would make both variables point at the exact
same object), lets a form be edited freely without silently mutating
whatever it was loaded from.

### Discard the Throwaway Example
Delete the `lab-loadform` folder. The field-by-field copy pattern is not
discarded — the real form's selection handler uses exactly this next.

### Mechanical Walkthrough

- `draft.Name = selected.Name;` — reappearing (plain property
  assignment, familiar since Lesson 1), the specific detail worth naming:
  this line copies a `string`'s *value*, not a reference to `selected`
  itself — `string` being immutable makes this especially safe to reason
  about, but the same copy-the-value principle applies identically to
  `int`, `decimal`, `DateTime?`, and `bool`, every type
  `InventoryItem`'s own fields use.
- `draft.Name = "Whiskers Jr.";` — reappearing, included purely to prove
  `selected` doesn't change alongside it.

### CS Lens

This is a **shallow copy** performed by hand, field by field — copying
each property's current value into a new object, without any shared
mutable state between the two afterward (for these particular types,
every field is either immutable itself or a value type). Lesson 27 gives
this idea — and its real limits, once a field is itself a mutable
reference type — a full, formal treatment; this unit only needs the
narrow, safe case: independent fields, independently copyable, no deeper
proof required yet.

### SE Lens

Why not just set `NewItemDraft = selectedItem;` directly — the same
object, not a copy — since it's less code? Because `NewItemDraft` is
two-way bound to the Add form's own controls (`NameInput`,
`CategoryComboBox`, and the rest); the instant a user changed anything in
the form, that change would already be live on the object sitting in
`Items` and shown in `ItemsGrid` — before Save was ever clicked, before
any `UPDATE` ran, and with no way to back out of an in-progress edit.
Copying values into a fresh, independent `InventoryItem` keeps the form's
draft state genuinely separate from what's actually saved until Save
says otherwise.

### Connection

The real `ItemsGrid_SelectionChanged` handler copies a selected
`InventoryItem`'s fields into `NewItemDraft` this way next.

---

## Concept Unit: `UPDATE ... WHERE Id = @id`

### The Problem

`SaveItemToDatabase` only ever runs `INSERT` — every click of the Add
button creates a brand new row, even one meant to correct an existing
item's typo.

### Introduce the Concept in Isolation
```bash
dotnet new console -o lab-update
cd lab-update
dotnet add package Microsoft.Data.Sqlite
```

Replace `Program.cs`:

```csharp
using Microsoft.Data.Sqlite;

using SqliteConnection connection = new SqliteConnection("Data Source=lab.db");
connection.Open();

using (SqliteCommand createTable = connection.CreateCommand())
{
    createTable.CommandText = "CREATE TABLE IF NOT EXISTS Items (Id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL)";
    createTable.ExecuteNonQuery();
}

using (SqliteCommand insert = connection.CreateCommand())
{
    insert.CommandText = "INSERT INTO Items (Name) VALUES (@name)";
    insert.Parameters.AddWithValue("@name", "Original Name");
    insert.ExecuteNonQuery();
}

long newId;
using (SqliteCommand idQuery = connection.CreateCommand())
{
    idQuery.CommandText = "SELECT last_insert_rowid()";
    newId = (long)idQuery.ExecuteScalar()!;
}
Console.WriteLine($"Inserted row Id: {newId}");

using (SqliteCommand update = connection.CreateCommand())
{
    update.CommandText = "UPDATE Items SET Name = @name WHERE Id = @id";
    update.Parameters.AddWithValue("@name", "Updated Name");
    update.Parameters.AddWithValue("@id", newId);
    int rowsAffected = update.ExecuteNonQuery();
    Console.WriteLine($"Rows affected by UPDATE: {rowsAffected}");
}

using (SqliteCommand select = connection.CreateCommand())
{
    select.CommandText = "SELECT Id, Name FROM Items WHERE Id = @id";
    select.Parameters.AddWithValue("@id", newId);
    using SqliteDataReader reader = select.ExecuteReader();
    while (reader.Read())
    {
        Console.WriteLine($"Row {reader.GetInt32(0)}: {reader.GetString(1)}");
    }
}
```

Run it:

```bash
dotnet run
```

Real output:

```text
Inserted row Id: 1
Rows affected by UPDATE: 1
Row 1: Updated Name
```

#### Execution Trace

1. `INSERT` runs, creating exactly one row; `SELECT last_insert_rowid()`
   reads back its real `Id`, printed as `Inserted row Id: 1`.
2. `UPDATE ... WHERE Id = @id`, with `@id` bound to that same `1`, runs
   against the one-row table — SQLite finds exactly one matching row and
   changes its `Name`; `ExecuteNonQuery()` returns `1`, printed as
   `Rows affected by UPDATE: 1`.
3. The final `SELECT ... WHERE Id = @id` runs; its `foreach` visits
   exactly one row (the only row in the table, and the only one that
   could match `Id = 1`), printing `Row 1: Updated Name` — proof the
   *same* row now holds the new value, not a second row alongside the
   original.

*What this proves:* `UPDATE Items SET Name = @name WHERE Id = @id`
modifies the *existing* row whose `Id` matches — no new row was created
(the final `SELECT` still finds exactly one row, `Id` `1`, the same row
`INSERT` created); its `Name` genuinely changed from `"Original Name"` to
`"Updated Name"`. `ExecuteNonQuery()`'s return value, `1`, is **rows
affected** — here confirming exactly one row matched `WHERE Id = @id`
and was changed, the same parameterized-query safety (Lesson 12 by way
of the `INSERT`s already in this project) protecting the `WHERE` clause's
own value from SQL injection.

### Discard the Throwaway Example
Delete the `lab-update` folder. `UPDATE ... WHERE` is not discarded — the
real `UpdateItemInDatabase` method uses exactly this next.

### Mechanical Walkthrough

- `UPDATE Items SET Name = @name WHERE Id = @id` — **first appearance of
  `UPDATE`.** `SET` names which column(s) change and to what; `WHERE`
  restricts the change to matching rows only — omitting `WHERE` entirely
  would update *every* row in the table, a real, common, serious mistake
  this project avoids by always parameterizing `Id`.
- `int rowsAffected = update.ExecuteNonQuery();` — reappearing
  (`ExecuteNonQuery`, familiar since Lesson 9's `CREATE TABLE`), the
  return value read for the first time — always `0` for `CREATE TABLE`
  (nothing to count), meaningfully non-zero here.
- `SELECT last_insert_rowid()` — (first appearance) — a SQLite-specific
  scalar query returning the `Id` SQLite just auto-assigned to the most
  recent `INSERT` on this connection; used only in this throwaway lab to
  get a real `Id` to update against — the real project already has each
  item's `Id`, read back by `LoadItemsFromDatabase` since Lesson 10.

### CS Lens

`INSERT` and `UPDATE` are the two halves of a **persist** operation,
distinguished by exactly one fact: does a row already exist to modify?
This is the identical shape a Save button in any real application faces —
"create" and "update" are rarely two unrelated operations; they're one
decision (does this record already have an identity?) determining which
of two closely related SQL statements to run.

### SE Lens

Why does `UPDATE`'s `WHERE` clause use `Id` specifically, rather than,
say, matching on `Name`? Because `Id` is this table's **primary key**
(Lesson 9) — guaranteed unique, guaranteed stable, never changed by an
edit. Matching on `Name` would be actively dangerous the moment two items
share a name, or the exact edit being saved is a name change itself — the
row being updated would either match the wrong item or, after the
`UPDATE` runs, no longer match its own `WHERE` clause on a second attempt.
`Id`, untouched by any field this project lets a user edit, is the only
column safe to build a `WHERE` clause on.

### Connection

The real Save flow decides between `INSERT` and this exact `UPDATE` based
on whether an item is currently being edited, next.

---

## Concept Unit: Wiring Select-to-Edit-to-Save

### The Problem

Selecting a row needs to load its values into the Add form; clicking Save
needs to know whether that means "create a new item" or "update the one
I just loaded" — and needs to actually run the right SQL for each case.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryPage.xaml`, `InventoryPage.xaml.cs`.
- **Change type:** Modify.
- **Dependencies:** `ItemsGrid_SelectionChanged`, Lesson 16;
  `AddButton_Click`/`SaveItemToDatabase`, Lessons 6/9; this lesson's
  first two units.

### The New Code — Tracking Which Item Is Being Edited

```csharp
private int? editingItemId;
```

### The New Code — Loading a Selection Into the Form

```csharp
private void ItemsGrid_SelectionChanged(object sender, SelectionChangedEventArgs e)
{
    DetailPanel.DataContext = ItemsGrid.SelectedItem;

    if (ItemsGrid.SelectedItem is InventoryItem selected)
    {
        editingItemId = selected.Id;
        NewItemDraft = new InventoryItem
        {
            Name = selected.Name,
            Category = selected.Category,
            Location = selected.Location,
            Value = selected.Value,
            PurchaseDate = selected.PurchaseDate,
            Notes = selected.Notes,
            IsFavorite = selected.IsFavorite
        };
    }
}
```

### The New Code — Save Deciding Between Insert and Update

```csharp
private void AddButton_Click(object sender, RoutedEventArgs e)
{
    if (string.IsNullOrWhiteSpace(NewItemDraft.Name))
    {
        return;
    }

    if (editingItemId is int id)
    {
        NewItemDraft.Id = id;
        UpdateItemInDatabase(NewItemDraft);

        for (int index = 0; index < Items.Count; index++)
        {
            if (Items[index].Id == id)
            {
                Items[index] = NewItemDraft;
                break;
            }
        }
    }
    else
    {
        Items.Add(NewItemDraft);
        SaveItemToDatabase(NewItemDraft);
    }

    editingItemId = null;
    NewItemDraft = new InventoryItem();
}
```

### The New Code — `UpdateItemInDatabase`

```csharp
private void UpdateItemInDatabase(InventoryItem item)
{
    using SqliteConnection connection = new SqliteConnection(ConnectionString);
    connection.Open();
    using SqliteCommand command = connection.CreateCommand();
    command.CommandText = "UPDATE Items SET Name = @name, Category = @category, Location = @location, Value = @value, PurchaseDate = @purchaseDate, Notes = @notes, IsFavorite = @isFavorite WHERE Id = @id";
    command.Parameters.AddWithValue("@name", item.Name);
    command.Parameters.AddWithValue("@category", item.Category.ToString());
    command.Parameters.AddWithValue("@location", item.Location);
    command.Parameters.AddWithValue("@value", item.Value.ToString(CultureInfo.InvariantCulture));
    command.Parameters.AddWithValue("@purchaseDate", (object?)item.PurchaseDate?.ToString("O") ?? DBNull.Value);
    command.Parameters.AddWithValue("@notes", item.Notes);
    command.Parameters.AddWithValue("@isFavorite", item.IsFavorite ? 1 : 0);
    command.Parameters.AddWithValue("@id", item.Id);
    command.ExecuteNonQuery();
}
```

### Mechanical Walkthrough

- `private int? editingItemId;` — reappearing (`Nullable<T>`, Lesson 14),
  applied here to mean "not currently editing anything" (`null`) versus
  "editing the item with this real `Id`" — the exact same "genuinely
  absent, not a fake sentinel" reasoning Lesson 14 already established
  for `PurchaseDate`.
- `if (ItemsGrid.SelectedItem is InventoryItem selected)` — (first
  appearance of **pattern matching with `is`**) — combines a type check
  and a cast into one expression: `selected` is only usable inside the
  `if` block, and only if `SelectedItem` really is an `InventoryItem`
  (never `null`, since `SelectedItem` is `null` when nothing's selected,
  and `null is InventoryItem` is always `false`) — safer than the plain
  `(InventoryItem)` cast this project has used elsewhere, because a
  failed match here just skips the block instead of throwing.
- `NewItemDraft = new InventoryItem { Name = selected.Name, ... }` —
  reappearing (object initializer syntax, familiar since `new InventoryItem()`
  itself), applying this lesson's first unit's copy pattern to all seven
  fields at once.
- `if (editingItemId is int id)` — the same pattern-matching shape,
  applied to `Nullable<T>` this time: unwraps `editingItemId` into a
  plain, non-nullable `int id`, usable only inside the block, only when
  `editingItemId` actually has a value — a cleaner alternative to
  `editingItemId.HasValue` plus `editingItemId.Value` (Lesson 14) doing
  the same two things separately.
- `NewItemDraft.Id = id;` — reappearing (plain property assignment,
  familiar since Lesson 1), the specific detail worth naming: `Id` has,
  until now, only ever been assigned by `LoadItemsFromDatabase` reading
  a real row back (Lesson 10); this is the first time this project's own
  code assigns it directly, specifically so the freshly-copied
  `NewItemDraft` (built with no `Id` of its own, back in
  `ItemsGrid_SelectionChanged`) carries the *same* `Id` the row being
  edited already has in the database — without this line,
  `UpdateItemInDatabase`'s own `WHERE Id = @id` below would target row
  `0`, matching nothing.
- `UpdateItemInDatabase(NewItemDraft);` — **first appearance of this
  call site.** Forward-references the method defined next; walked
  through fully, below, once its own code is shown.
- `for (int index = 0; index < Items.Count; index++) { if (Items[index].Id == id) { ... } }`
  — reappearing (a plain indexed loop, the same shape as any `for` loop
  already assumed known from this project's stated floor), scanning
  `Items` by hand for the one entry whose `Id` matches — this project has
  never needed LINQ's query methods, and doesn't start now; a plain loop
  says exactly the same thing with no new vocabulary.
- `Items[index] = NewItemDraft;` — (first appearance of assigning by
  index into an `ObservableCollection<T>`) — replaces the old object at
  that position with the freshly edited one; `ObservableCollection<T>`
  raises its own change notification for this exact operation, which is
  why `ItemsGrid` (bound to `Items` via `GroupedItems`) updates
  immediately with no manual refresh.
- `break;` — reappearing (already assumed known from this project's
  stated floor), stopping the scan the moment the matching `Id` is
  found, since `Id` is unique and no later iteration could ever match
  again.

### Mechanical Walkthrough — `UpdateItemInDatabase`'s Own Body

The call site above only *reaches* `UpdateItemInDatabase`; this method's
own code — this lesson's actual SQL-update subject matter — hasn't been
enumerated yet:

- `using SqliteConnection connection = new SqliteConnection(ConnectionString); connection.Open(); using SqliteCommand command = connection.CreateCommand();`
  — reappearing (Lesson 9's connect/open/create-command shape), the
  identical three lines this lesson's own second unit's throwaway lab
  already used to run its `UPDATE`, now inside the real project.
- `command.CommandText = "UPDATE Items SET Name = @name, Category = @category, Location = @location, Value = @value, PurchaseDate = @purchaseDate, Notes = @notes, IsFavorite = @isFavorite WHERE Id = @id";`
  — reappearing (`UPDATE ... WHERE`, this lesson's second unit, given
  full treatment there with real, rows-affected output) — the same
  shape, extended from updating just `Name` to every column
  `InventoryItem` actually has.
- `command.Parameters.AddWithValue("@name", item.Name);` — reappearing
  (Lesson 9's parameterized-query pattern), guarding `Name` against SQL
  injection the identical way `SaveItemToDatabase`'s own `INSERT`
  already does.
- `command.Parameters.AddWithValue("@category", item.Category.ToString());`
  — reappearing (Lesson 12's `enum`-as-`TEXT` serialization) — the same
  `ToString()` round-trip already proven for `INSERT`.
- `command.Parameters.AddWithValue("@location", item.Location);` —
  reappearing, a plain `string` parameter, the same shape as `@name`.
- `command.Parameters.AddWithValue("@value", item.Value.ToString(CultureInfo.InvariantCulture));`
  — reappearing (`CultureInfo.InvariantCulture`, Lesson 13's fifth unit,
  cited in full in this lesson's own Header) — the exact fixed,
  machine-independent decimal format `SaveItemToDatabase` already writes,
  required here for the identical reason: this text has to
  `decimal.Parse` back correctly regardless of which machine's regional
  settings are running when it's later read.
- `command.Parameters.AddWithValue("@purchaseDate", (object?)item.PurchaseDate?.ToString("O") ?? DBNull.Value);`
  — reappearing (Lesson 14's fifth unit gives `?.`, `??`, `"O"`, and
  `DBNull.Value` each full treatment; `DBNull.Value` is also cited in
  full in this lesson's own Header) — `?.` short-circuits to `null`
  when `PurchaseDate` is absent rather than throwing on `.ToString("O")`;
  `?? DBNull.Value` then swaps that C# `null` for ADO.NET's own
  "genuinely empty cell" sentinel, since a bare `null` here would throw
  instead of writing a real SQL `NULL`.
- `command.Parameters.AddWithValue("@notes", item.Notes);` — reappearing,
  the same plain `string` parameter shape as `@name`/`@location`.
- `command.Parameters.AddWithValue("@isFavorite", item.IsFavorite ? 1 : 0);`
  — reappearing (the ternary/conditional operator applied to a `bool`
  going into SQLite, first given full treatment in Lesson 15) — SQLite
  has no native boolean column type, so `true`/`false` round-trips as
  `1`/`0`, the identical conversion `SaveItemToDatabase` already
  performs.
- `command.Parameters.AddWithValue("@id", item.Id);` — reappearing
  (a plain `int` parameter, the same shape every other parameter here
  uses), the value this lesson's second unit already proved, with real
  output, correctly restricts the `UPDATE` to exactly one row — here
  supplied by `NewItemDraft.Id`, set moments earlier in
  `AddButton_Click`.
- `command.ExecuteNonQuery();` — reappearing (`ExecuteNonQuery()`,
  Lesson 9; its **rows affected** return value, Lesson 21's own second
  unit) — the return value is discarded here, unlike the throwaway
  lab's `int rowsAffected = ...`, because the real UI already has its
  own, separate confirmation that the edit worked: `Items[index] =
  NewItemDraft`, back in `AddOrUpdateItem`, visibly updates the grid the
  instant this call returns.

### CS Lens

`editingItemId`'s two states — `null` versus a real `int` — are a tiny,
explicit **state machine**: "not editing" and "editing item N," with
`AddButton_Click`'s `if`/`else` the only place that state is read, and
`ItemsGrid_SelectionChanged`/the end of `AddButton_Click` the only two
places it changes. Lesson 29 gives this idea a full, formal treatment
with real, named states and explicit transition rules; this unit is the
first, narrow instance of the same underlying pattern — a value tracking
"where are we in this process," checked before deciding what to do next.

### SE Lens

Why does saving an edit call `UpdateItemInDatabase` *and* manually replace
the item in `Items`, rather than just mutating the existing object's
properties in place (`existing.Name = NewItemDraft.Name;`, and so on for
every field)? Because `NewItemDraft` is already a complete, correctly
populated `InventoryItem` — replacing the old object with it in one
assignment is simpler and less error-prone than copying seven fields back
by hand a second time, the exact kind of repetition this lesson's first
unit's copy already did once, in the other direction. `Items[index] = NewItemDraft;`
also means `NewItemDraft` (still referenced by `DetailPanel` if that
exact item happens to be selected) and the grid's row are now the *same*
object again — intentional, now that Save has genuinely committed the
change to the database first.

### Commands Needed

```bash
dotnet run
```

### Run It

On your Windows machine: select an existing item — the Add form
pre-fills with its real values. Change the name, click Save (the button
still says "Add," doing double duty — Exercises below revisit this): the
grid updates immediately, and the row count doesn't grow. Fully quit and
reopen the app: the edited name is still there, confirming the `UPDATE`
genuinely persisted. Click into empty space to deselect, fill the form
fresh, and click Save again: a brand new row is created, exactly as
before this lesson — editing and creating now share one form, one
button, one method, deciding correctly every time.

### Connection

Every field this project has grown since Epic 3 is now genuinely
editable, not just viewable. The next lesson adds a real confirmation
step before a more destructive action this project doesn't have yet:
deleting an item.

---

## Closing

### Connect the Pieces

Selecting a row in `ItemsGrid` fires `ItemsGrid_SelectionChanged`
(third unit), which both updates `DetailPanel` (unchanged since Lesson 8)
and — new this lesson — copies the selected item's seven fields into a
fresh `NewItemDraft`, the exact independent-copy pattern proven with real
output in this lesson's first unit, while recording `editingItemId`.
Clicking Save reads that same `editingItemId`: if it holds a real `Id`,
`UpdateItemInDatabase` runs the `UPDATE ... WHERE Id = @id` proven with
real, rows-affected output in the second unit, and `Items[index] = NewItemDraft`
swaps the in-memory object; otherwise, the original Lesson 6/9 `INSERT`
path runs unchanged. Either way, `editingItemId` resets to `null` and the
form clears, ready for the next add or edit.

### What Breaks Without This

Temporarily remove `WHERE Id = @id` from `UpdateItemInDatabase`'s
`CommandText` (leaving just `UPDATE Items SET Name = @name, ...`
targeting every column, no `WHERE` at all). Add two items, edit one of
them, and click Save. Real, representative failure: `ExecuteNonQuery()`
still returns successfully — SQLite has no objection to updating every
row — but *every* item in the database now has the edited item's values,
because a missing `WHERE` clause means the `SET` applies to the entire
table, not just the one row this lesson's `@id` parameter was meant to
restrict it to. Fully quitting and reopening the app makes this
unmistakable: both items are now identical. This is exactly the "real,
common, serious mistake" this lesson's second unit's own Mechanical
Walkthrough named in advance. Restore `WHERE Id = @id` afterward.

### Exercises

- Change the Save button's `Content` to read `"Save"` when
  `editingItemId` has a value and `"Add"` otherwise — you'll need to
  update it in both `ItemsGrid_SelectionChanged` (when editing starts)
  and at the end of `AddButton_Click` (when it resets) — confirm the
  label genuinely reflects which mode the form is currently in.
- In the `lab-update` throwaway pattern, insert two rows instead of one,
  then run an `UPDATE ... WHERE Id = @id` targeting only the second —
  confirm, with real output, that the first row's data is completely
  unaffected.
- Predict, in your own words, what currently happens if you select an
  item, start editing its name, then select a *different* item before
  clicking Save — does your first edit survive, silently apply to the
  wrong item, or simply vanish? Reason from the real code in
  `ItemsGrid_SelectionChanged` before testing it.

### Definition of Done

- [ ] Selecting a row in `ItemsGrid` pre-fills the Add form with that
      item's real values, via an independent copy, not the same object.
- [ ] Clicking Save while an item is loaded for editing runs a real
      `UPDATE ... WHERE Id = @id`, not an `INSERT`.
- [ ] Clicking Save with nothing loaded for editing still creates a new
      item, exactly as before this lesson.
- [ ] An edit survives a full quit and reopen of the app.
- [ ] You reproduced the missing-`WHERE`-clause bug on purpose, confirmed
      it corrupts every row rather than just one, and restored the real
      `WHERE Id = @id` clause.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Reuse the Add form for editing existing items via UPDATE ... WHERE Id = @id"`.
