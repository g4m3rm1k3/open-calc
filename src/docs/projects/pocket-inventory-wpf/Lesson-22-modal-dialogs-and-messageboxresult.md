# Lesson 22: A Deliberate Pause Before Something Irreversible

*(`MessageBox.Show`, `MessageBoxResult`, `MessageBoxButton`)*

**User Story**
> As a user, I want to delete items, with a confirmation step so I don't
> lose one by accident.

**What you will build**
This project has no way to remove an item at all yet. This lesson adds
one — a real `DELETE`, permanent, the first genuinely destructive action
this project has ever offered — gated behind a real Yes/No confirmation
dialog. Nothing disappears from a single accidental click.

**What you need to know first:** Lesson 9: `CREATE TABLE`,
`ExecuteNonQuery`. Lesson 21: `WHERE Id = @id`, `ItemsGrid_SelectionChanged`.

**Terms introduced in this lesson:**
- **`MessageBox.Show`** — a built-in WPF method that opens a real, modal
  system dialog box and blocks the calling code until the user responds
  to it.
- **`MessageBoxButton`** — which buttons the dialog offers
  (`YesNo`, `OKCancel`, `YesNoCancel`, and others).
- **`MessageBoxResult`** — an enum naming which button the user actually
  clicked, returned directly by `MessageBox.Show`.
- **`DELETE ... WHERE`** — the SQL statement that permanently removes rows
  matching a condition.

---

## Concept Unit: `DELETE ... WHERE Id = @id`

### The Problem

`Items` and the database can currently only grow — nothing in this
project has ever removed a row. Deleting needs the identical
"parameterize the `WHERE` clause on a real, stable `Id`" discipline
Lesson 21's `UPDATE` already established, applied to `DELETE` instead.

### Introduce the Concept in Isolation
```bash
dotnet new console -o lab-delete
cd lab-delete
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
    insert.Parameters.AddWithValue("@name", "Widget A");
    insert.ExecuteNonQuery();
    insert.Parameters.Clear();
    insert.Parameters.AddWithValue("@name", "Widget B");
    insert.ExecuteNonQuery();
}

Console.WriteLine("Before delete:");
PrintAll();

using (SqliteCommand delete = connection.CreateCommand())
{
    delete.CommandText = "DELETE FROM Items WHERE Name = @name";
    delete.Parameters.AddWithValue("@name", "Widget A");
    int rowsAffected = delete.ExecuteNonQuery();
    Console.WriteLine($"Rows affected by DELETE: {rowsAffected}");
}

Console.WriteLine("After delete:");
PrintAll();

void PrintAll()
{
    using SqliteCommand select = connection.CreateCommand();
    select.CommandText = "SELECT Id, Name FROM Items";
    using SqliteDataReader reader = select.ExecuteReader();
    while (reader.Read())
    {
        Console.WriteLine($"  {reader.GetInt32(0)}: {reader.GetString(1)}");
    }
}
```

Run it:

```bash
dotnet run
```

Real output:

```text
Before delete:
  1: Widget A
  2: Widget B
Rows affected by DELETE: 1
After delete:
  2: Widget B
```

#### Execution Trace

1. `PrintAll()`, called before any delete, opens a `SELECT` whose
   `foreach` visits both inserted rows in order: `1: Widget A`,
   `2: Widget B`.
2. `DELETE FROM Items WHERE Name = @name`, bound to `"Widget A"`, runs —
   SQLite finds exactly one matching row and removes it permanently;
   `ExecuteNonQuery()` returns `1`.
3. `PrintAll()` runs a second time, opening a fresh `SELECT` — its
   `foreach` now visits only one row, `2: Widget B`; `Widget A`'s row is
   gone entirely, not just hidden, and `Widget B`'s own `Id` (`2`) is
   unchanged by the deletion of a different row.

*What this proves:* `DELETE FROM Items WHERE Name = @name` removes only
the row(s) matching `WHERE` — `Widget A` (`Id` `1`) is gone; `Widget B`
(`Id` `2`) is completely untouched, still present with its original
`Id`. `ExecuteNonQuery()` returns `1` — one row matched and was removed —
the identical **rows affected** contract Lesson 21's `UPDATE` already
established, now confirming a deletion instead of a modification.

### Discard the Throwaway Example
Delete the `lab-delete` folder. `DELETE ... WHERE` is not discarded — the
real `DeleteItemFromDatabase` method uses exactly this next, parameterized
on `Id` rather than `Name`.

### Mechanical Walkthrough

- `DELETE FROM Items WHERE Name = @name` — **first appearance of
  `DELETE`.** Structurally the simplest of the three data-modifying
  statements this project now knows (`INSERT`, `UPDATE`, `DELETE`) — no
  `SET`, just a table and a `WHERE` clause naming which rows to remove
  permanently.
- Omitting `WHERE` entirely here would delete *every* row in the table —
  the identical, even more dangerous version of the missing-`WHERE`
  mistake Lesson 21's "What Breaks Without This" already proved for
  `UPDATE`.

### CS Lens

`INSERT`, `UPDATE`, and `DELETE` are the three operations of any
persistent store's basic **CRUD** contract (Create, Read, Update,
Delete) — `SELECT` was this project's first "R," back in Lesson 10; this
lesson completes the set. Every one of the four shares the identical
parameterized-`WHERE`-clause discipline this project has followed since
`SaveItemToDatabase`'s very first `INSERT`.

### SE Lens

Why does this project never implement a "soft" delete here — marking a
row as removed instead of actually running `DELETE`? Because that's a
deliberate, distinct design this project makes later, on purpose (Lesson
28), once the tradeoff (recoverability vs. unbounded storage growth) can
be stated honestly, with a real feature (an Archive view) built around
it — introducing it silently here, as if `DELETE` alone were somehow
incomplete, would undercut that lesson's own reason for existing.

### Connection

The real Delete button runs exactly this `DELETE`, guarded by a real
confirmation dialog, next.

---

## Concept Unit: `MessageBox.Show` and `MessageBoxResult`

### The Problem

A `DELETE` is permanent — nothing in this project has ever offered an
action that can't be undone by fully quitting without saving (Lesson 21's
edits, for instance, only commit when Save is clicked). A misplaced click
on a Delete button deserves a real pause before anything is actually
removed.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryPage.xaml`, `InventoryPage.xaml.cs`.
- **Change type:** Add.
- **Dependencies:** `ItemsGrid.SelectedItem`, Lesson 16;
  `DELETE ... WHERE`, previous unit.

### The New Code — the Delete Button

```xml
<Button Content="Delete"
        Style="{StaticResource ToolbarButtonStyle}"
        Margin="12,0,0,0"
        Click="DeleteButton_Click" />
```

### The New Code — the Handler

```csharp
private void DeleteButton_Click(object sender, RoutedEventArgs e)
{
    if (ItemsGrid.SelectedItem is not InventoryItem selected)
    {
        return;
    }

    MessageBoxResult result = MessageBox.Show(
        $"Delete \"{selected.Name}\"? This cannot be undone.",
        "Confirm Delete",
        MessageBoxButton.YesNo,
        MessageBoxImage.Warning);

    if (result == MessageBoxResult.Yes)
    {
        DeleteItemFromDatabase(selected.Id);
        Items.Remove(selected);
    }
}

private void DeleteItemFromDatabase(int id)
{
    using SqliteConnection connection = new SqliteConnection(ConnectionString);
    connection.Open();
    using SqliteCommand command = connection.CreateCommand();
    command.CommandText = "DELETE FROM Items WHERE Id = @id";
    command.Parameters.AddWithValue("@id", id);
    command.ExecuteNonQuery();
}
```

### The Updated Project — the Add Row

```xml
<Button Content="Add"
        Style="{StaticResource ToolbarButtonStyle}"
        Margin="12,0,0,0"
        Click="AddButton_Click" />
<Button Content="Delete"                                                          <!-- ← new -->
        Style="{StaticResource ToolbarButtonStyle}"                               <!-- ← new -->
        Margin="12,0,0,0"                                                          <!-- ← new -->
        Click="DeleteButton_Click" />                                              <!-- ← new -->
```

### Mechanical Walkthrough

- `if (ItemsGrid.SelectedItem is not InventoryItem selected)` — reappearing
  (pattern matching with `is`, Lesson 21), the negated form (`is not`) —
  first appearance of `is not` specifically — reads naturally as a guard
  clause: "if nothing valid is selected, stop here," letting the rest of
  the method assume `selected` is real for the remainder of its body.
- `MessageBox.Show(message, title, MessageBoxButton.YesNo, MessageBoxImage.Warning)`
  — **first appearance of `MessageBox.Show`.** Opens a real, modal system
  dialog — code after this line does not run until the user responds;
  `MessageBoxButton.YesNo` — (first appearance) — offers exactly two
  buttons; `MessageBoxImage.Warning` — (first appearance) — shows a
  standard warning icon, a visual cue this is worth pausing over.
- `MessageBoxResult result = ...` — **first appearance of
  `MessageBoxResult`.** The enum value naming which button was actually
  clicked — `MessageBoxResult.Yes`, `.No`, and (for other
  `MessageBoxButton` configurations) `.OK`, `.Cancel`.
- `if (result == MessageBoxResult.Yes)` — only `Yes` proceeds; clicking
  `No`, or closing the dialog with the window's own close button (which
  also returns `MessageBoxResult.No` for a `YesNo` dialog), leaves
  `Items` and the database completely untouched.
- `Items.Remove(selected);` — (first appearance of `.Remove` on
  `ObservableCollection<T>`) — removes the item from the in-memory
  collection; `ObservableCollection<T>`'s own change notification (the
  same mechanism behind every live `ItemsGrid` update since Lesson 7)
  updates the grid immediately, with no manual refresh.

### CS Lens

`MessageBox.Show` being **modal** — blocking the calling method until it
returns — is a real, deliberate control-flow choice: `DeleteButton_Click`
genuinely pauses mid-execution, and everything after the `MessageBox.Show`
call only runs once a real answer exists. This is different from every
event handler this project has written so far, all of which run
start-to-finish in one uninterrupted pass; a modal dialog is the first
place user input arrives *during* a method's execution rather than only
at its start.

### SE Lens

Why gate the confirmation behind checking `result == MessageBoxResult.Yes`
specifically, rather than just checking `result != MessageBoxResult.No`?
Because a `YesNo` dialog can, in principle, be dismissed in ways that
return neither `Yes` nor a clean `No` on some platforms or accessibility
paths — explicitly requiring `Yes` means *only* an unambiguous,
deliberate confirmation deletes anything; every other outcome, named or
not, safely does nothing. This is the same "default to the safe
behavior, require explicit action for the dangerous one" principle behind
`IsReadOnly="True"` on `ItemsGrid` back in Lesson 16.

### Commands Needed

```bash
dotnet run
```

### Run It

On your Windows machine: select an item, click Delete — a real dialog
appears naming the item and warning the action can't be undone. Click No
(or close the dialog): nothing happens, the item is still there. Select
the same item, click Delete, click Yes: the row disappears from
`ItemsGrid` immediately. Fully quit and reopen the app: the deleted item
does not come back, confirming the real `DELETE` persisted.

### Connection

Every core operation — create, read, update, delete — is now real and
working. The next lesson addresses a real problem all of Epic 2/3/5's
code-behind click handlers have quietly accumulated: `AddButton_Click`,
`DeleteButton_Click`, and the selection handler are starting to pile up
validation and refresh logic that would benefit from a cleaner split.

---

## Closing

### Connect the Pieces

Selecting a row and clicking Delete calls `DeleteButton_Click`, which
first confirms a real selection exists via the same `is` pattern-matching
guard Lesson 21 introduced, then opens `MessageBox.Show` — a real, modal
dialog, blocking until answered. Only `MessageBoxResult.Yes` proceeds to
`DeleteItemFromDatabase`, running the exact `DELETE ... WHERE Id = @id`
proven with real, rows-affected output in this lesson's first unit, and
`Items.Remove(selected)`, the same `ObservableCollection<T>` change
notification that's kept `ItemsGrid` live since Lesson 7.

### What Breaks Without This

Temporarily remove the `if (result == MessageBoxResult.Yes)` check
entirely, calling `DeleteItemFromDatabase`/`Items.Remove` unconditionally
right after `MessageBox.Show` returns, regardless of which button was
clicked. Rerun, select an item, click Delete, then click No. Real,
representative failure: the item vanishes from `ItemsGrid` anyway — the
dialog appeared, asked a real question, and its answer was completely
ignored. This is worse than having no confirmation at all: a user who
clicks No, trusting the dialog meant something, loses data believing
they'd prevented exactly that. Restore the real `if` check afterward.

### Exercises

- In the `lab-delete` throwaway pattern, insert three rows and delete two
  of them with two separate parameterized `DELETE` calls — confirm, with
  real output, that exactly the intended one row remains.
- Change `MessageBoxButton.YesNo` to `MessageBoxButton.YesNoCancel` and
  add a `Console.WriteLine`-equivalent (a debug line, or a breakpoint) to
  inspect what `MessageBoxResult` a real Cancel click produces — confirm
  it's neither `Yes` nor `No`.
- Predict, in your own words, what happens if `DeleteButton_Click` is
  invoked with nothing selected in `ItemsGrid` (`SelectedItem` is
  `null`) — trace through the `is not InventoryItem selected` guard
  before testing it on the real, running app.

### Definition of Done

- [ ] A Delete button exists, calling `DeleteButton_Click`.
- [ ] Clicking Delete with an item selected shows a real, modal
      confirmation dialog naming the item.
- [ ] Clicking No (or closing the dialog) leaves the item completely
      untouched.
- [ ] Clicking Yes removes the item from `ItemsGrid` immediately and
      permanently from the database — confirmed by a full quit and
      reopen.
- [ ] You reproduced the ignored-answer bug on purpose, confirmed
      clicking No still deleted the item, and restored the real
      `if (result == MessageBoxResult.Yes)` check.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add confirmed, permanent item deletion via MessageBox and DELETE ... WHERE Id"`.
