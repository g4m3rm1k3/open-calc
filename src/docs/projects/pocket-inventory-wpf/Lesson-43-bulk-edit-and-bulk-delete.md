# Lesson 43: One Trip to the Database, Not Two Hundred

*(Iterating `SelectedItems`, one transaction for many rows)*

**User Story**
> As a user, I want to act on my whole selection at once — change every
> selected item's category in one step, or delete all of them with one
> confirmation.

**What you will build**
Real bulk actions, using the multi-selection Lesson 42 already reads
correctly. This lesson also proves something genuinely dramatic, with
real, measured numbers: wrapping many database writes in one real
transaction instead of letting each auto-commit separately isn't a
minor optimization — it's roughly two orders of magnitude faster,
proven directly before trusting it.

**What you need to know first:** Lesson 42: `viewModel.SelectedItems`,
already a real, correctly-typed list. Lesson 22: confirmed, destructive
actions.

**Terms introduced in this lesson:**
- **Transaction** — a group of database operations treated as one
  atomic unit: either all of them take effect, or (if something fails
  partway through, or `Rollback()` is called deliberately) none of them
  do.
- **Auto-commit** — SQLite's default behavior: every single statement
  not explicitly wrapped in a transaction is its own separate
  transaction, committed to disk immediately, one at a time.

**Objects and methods used**
- `SelectedItems`/`IList` (Lesson 42) reappear here, already given
  full treatment — brief reminder only, per the Repetition Rule.
  SQLite transactions are this lesson's own subject, given full
  treatment below.

---

## Concept Unit: A Real Transaction — Proving It's Actually Faster

### The Problem

Updating 200 rows one at a time, each its own separate database write,
works — but is it actually slow enough to matter, or is "wrap it in a
transaction" premature optimization? Worth measuring directly before
deciding it matters.

### Introduce the Concept in Isolation
```bash
dotnet new console -o lab-transaction
cd lab-transaction
dotnet add package Microsoft.Data.Sqlite
```

Replace `Program.cs`:

```csharp
using Microsoft.Data.Sqlite;
using System.Diagnostics;

using SqliteConnection connection = new SqliteConnection("Data Source=lab.db");
connection.Open();

using (var c = connection.CreateCommand()) { c.CommandText = "CREATE TABLE IF NOT EXISTS Items (Id INTEGER PRIMARY KEY AUTOINCREMENT, Category TEXT NOT NULL)"; c.ExecuteNonQuery(); }
using (var c = connection.CreateCommand()) { c.CommandText = "DELETE FROM Items"; c.ExecuteNonQuery(); }

for (int i = 0; i < 200; i++)
{
    using var insert = connection.CreateCommand();
    insert.CommandText = "INSERT INTO Items (Category) VALUES ('Tools')";
    insert.ExecuteNonQuery();
}

Stopwatch sw1 = Stopwatch.StartNew();
for (int i = 1; i <= 200; i++)
{
    using var update = connection.CreateCommand();
    update.CommandText = "UPDATE Items SET Category = 'Electronics' WHERE Id = @id";
    update.Parameters.AddWithValue("@id", i);
    update.ExecuteNonQuery();
}
sw1.Stop();
Console.WriteLine($"200 individual UPDATEs (auto-commit each): {sw1.ElapsedMilliseconds}ms");

Stopwatch sw2 = Stopwatch.StartNew();
using (SqliteTransaction transaction = connection.BeginTransaction())
{
    for (int i = 1; i <= 200; i++)
    {
        using var update = connection.CreateCommand();
        update.Transaction = transaction;
        update.CommandText = "UPDATE Items SET Category = 'Consumables' WHERE Id = @id";
        update.Parameters.AddWithValue("@id", i);
        update.ExecuteNonQuery();
    }
    transaction.Commit();
}
sw2.Stop();
Console.WriteLine($"200 UPDATEs in one real transaction: {sw2.ElapsedMilliseconds}ms");

using (SqliteTransaction transaction = connection.BeginTransaction())
{
    using var update = connection.CreateCommand();
    update.Transaction = transaction;
    update.CommandText = "UPDATE Items SET Category = 'ShouldNeverStick' WHERE Id = 1";
    update.ExecuteNonQuery();
    transaction.Rollback();
}
using (var check = connection.CreateCommand())
{
    check.CommandText = "SELECT Category FROM Items WHERE Id = 1";
    string? result = (string?)check.ExecuteScalar();
    Console.WriteLine($"Category after rollback: {result} (should be Consumables, not ShouldNeverStick)");
}
```

Run it:

```bash
dotnet run
```

Real output:

```text
200 individual UPDATEs (auto-commit each): 1753ms
200 UPDATEs in one real transaction: 12ms
Category after rollback: Consumables (should be Consumables, not ShouldNeverStick)
```

#### Execution Trace

Two hundred nearly-identical iterations each, so summarized as an
aggregate rather than traced one row at a time — the interesting fact
is the total, not any single row:

1. `sw1`'s loop runs 200 times, each iteration opening a brand-new
   `SqliteCommand`, running one `UPDATE`, and (with no transaction
   assigned) auto-committing immediately — 200 separate commits to
   disk, timed together as `1753ms`.
2. `sw2`'s loop also runs 200 times, structurally identical, except
   every `update.Transaction = transaction;` line means none of the 200
   individual `ExecuteNonQuery()` calls commits anything on its own.
3. `transaction.Commit()`, called once after the loop finishes, is the
   single real commit for all 200 updates together — timed as `12ms`
   total, the same 200 database writes, roughly 146 times faster.
4. The final rollback block runs one more `UPDATE` inside a third,
   separate transaction, then calls `Rollback()` instead of `Commit()`
   — the real `SELECT` immediately after confirms that update never
   took effect at all.

*What this proves:* the exact same 200 updates, run the exact same way
except for one detail — whether they're wrapped in a real transaction —
take `1753ms` individually versus `12ms` together, roughly **146 times
faster**. This isn't a minor tuning detail; SQLite genuinely commits
each auto-commit statement to disk separately, a real, measurable cost
paid 200 separate times versus once. The rollback proof is equally
real: a transaction begun, given one real `UPDATE`, then explicitly
rolled back, leaves the database exactly as if that `UPDATE` never
ran — `Category` for `Id 1` is still `"Consumables"` (the previous,
already-committed transaction's result), never `"ShouldNeverStick"`.

### Discard the Throwaway Example
Delete the `lab-transaction` folder. `SqliteTransaction` is not
discarded — the real bulk operations use exactly this next.

### Mechanical Walkthrough

- `connection.BeginTransaction()` — **first appearance of
  `SqliteTransaction`.** Starts a real transaction; every command
  assigned to it (`update.Transaction = transaction;`) becomes part of
  it instead of auto-committing on its own.
- `transaction.Commit()` — **first appearance.** Makes every change
  inside the transaction permanent, all at once — this is the one real
  disk-write "commit" moment for all 200 updates together, instead of
  200 separate ones.
- `transaction.Rollback()` — **first appearance.** Discards every
  change made inside the transaction since it began, as if none of them
  had ever run — proven directly, not just asserted, by the real
  `SELECT` confirming the pre-transaction value survived.

### CS Lens

This is **atomicity** — one of the classic ACID properties a real
transaction guarantees (Atomic, Consistent, Isolated, Durable, though
this project only needs to name the first here): a group of operations
that either all happen or none do, with no possible in-between state
where only some of 200 selected items got updated because something
failed partway through row 150.

### SE Lens

Why doesn't every single database write in this project need an
explicit transaction, given transactions are this much faster? Because
this project's existing single-row operations (`SaveItemToDatabase`,
`UpdateItemInDatabase`, and the rest) are already just one statement
each — there's nothing to batch, and auto-commit's per-statement cost is
completely invisible at that scale. Transactions earn their real
complexity specifically when *many* writes happen together, which is
exactly this lesson's own subject and nothing before it.

### Connection

Real bulk category changes and bulk deletes, both wrapped in exactly
this kind of transaction, are built next.

---

## Concept Unit: Real Bulk Edit and Bulk Delete

### The Problem

`viewModel.SelectedItems` (Lesson 42) already holds a real,
correctly-typed selection; nothing currently acts on more than one item
at once.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryPage.xaml`, `InventoryViewModel.cs`.
- **Change type:** Add.
- **Dependencies:** `SelectedItems`, Lesson 42; `SqliteTransaction`,
  previous unit; `MessageBox`, Lesson 22.

### The New Code — the Buttons

```xml
<Button Content="Bulk Set Category"
        Style="{StaticResource ToolbarButtonStyle}"
        Margin="12,0,0,0"
        Command="{Binding BulkSetCategoryCommand}"
        CommandParameter="{Binding ElementName=BulkCategoryBox, Path=SelectedItem}" />
<ComboBox x:Name="BulkCategoryBox"
          Width="120"
          Margin="12,0,0,0"
          ItemsSource="{Binding CategoryValues}" />
<Button Content="Bulk Delete"
        Style="{StaticResource ToolbarButtonStyle}"
        Margin="12,0,0,0"
        Command="{Binding BulkDeleteCommand}" />
```

### The New Code — the Commands

```csharp
public RelayCommand BulkSetCategoryCommand { get; }
public RelayCommand BulkDeleteCommand { get; }

// In the constructor:
BulkSetCategoryCommand = new RelayCommand(
    execute: parameter => BulkSetCategory((Category)parameter!),
    canExecute: _ => SelectedItems.Count > 0);

BulkDeleteCommand = new RelayCommand(
    execute: _ => BulkDelete(),
    canExecute: _ => SelectedItems.Count > 0);

private void BulkSetCategory(Category newCategory)
{
    using SqliteConnection connection = new SqliteConnection(ConnectionString);
    connection.Open();
    using SqliteTransaction transaction = connection.BeginTransaction();

    foreach (InventoryItem item in SelectedItems)
    {
        item.Category = newCategory;

        using SqliteCommand command = connection.CreateCommand();
        command.Transaction = transaction;
        command.CommandText = "UPDATE Items SET Category = @category WHERE Id = @id";
        command.Parameters.AddWithValue("@category", newCategory.ToString());
        command.Parameters.AddWithValue("@id", item.Id);
        command.ExecuteNonQuery();
    }

    transaction.Commit();
}

private void BulkDelete()
{
    MessageBoxResult result = MessageBox.Show(
        $"Delete {SelectedItems.Count} item(s)? This cannot be undone.",
        "Confirm Bulk Delete",
        MessageBoxButton.YesNo,
        MessageBoxImage.Warning);

    if (result != MessageBoxResult.Yes)
    {
        return;
    }

    using SqliteConnection connection = new SqliteConnection(ConnectionString);
    connection.Open();
    using SqliteTransaction transaction = connection.BeginTransaction();

    foreach (InventoryItem item in SelectedItems)
    {
        using SqliteCommand command = connection.CreateCommand();
        command.Transaction = transaction;
        command.CommandText = "DELETE FROM Items WHERE Id = @id";
        command.Parameters.AddWithValue("@id", item.Id);
        command.ExecuteNonQuery();

        Items.Remove(item);
    }

    transaction.Commit();
}
```

### Mechanical Walkthrough

- `canExecute: _ => SelectedItems.Count > 0` — reappearing
  (`RelayCommand`'s `canExecute`, Lesson 23), both bulk buttons visibly
  disable themselves the moment nothing is selected, the identical
  automatic-`IsEnabled` payoff every other command in this project has
  already demonstrated.
- One `BeginTransaction()`/`Commit()` pair wrapping the entire
  `foreach` in both methods — reappearing exactly (this lesson's first
  unit), applied for real: whether 2 items or 200 are selected, exactly
  one transaction, exactly one real commit.
- `MessageBox.Show($"Delete {SelectedItems.Count} item(s)? ...")` —
  reappearing (Lesson 22), one single confirmation covering the entire
  bulk operation — a real, deliberate choice named directly in this
  lesson's own SE Lens.
- `Items.Remove(item)` called inside the same `foreach` that also runs
  the real `DELETE` — reappearing (Lesson 23's `RemoveItem` shape),
  keeping `ItemsGrid` and the database consistent together, item by
  item, even though the underlying database writes are all batched into
  one transaction.

### CS Lens

This unit's own two methods are a direct, worked demonstration of
**batch operations vs. repeating a single-item operation N times** —
this lesson's own glossary phrase made concrete: the *code* still
iterates one item at a time (a plain `foreach`, nothing exotic), but
the *database cost* is paid once, not once per item, because every
individual `ExecuteNonQuery()` call happens inside the same open
transaction instead of auto-committing on its own.

### SE Lens

Why does `BulkDelete` show exactly *one* confirmation dialog for the
whole selection, rather than one confirmation per item (five items
selected, five separate "Are you sure?" dialogs)? Because a user who
selected five items and clicked "Bulk Delete" has already expressed
clear, deliberate intent about *all five* — confirming each one
individually would be repetitive, frustrating, and wouldn't actually
add any real safety over one clear, accurate confirmation stating
exactly how many items are about to be permanently removed.

### Commands Needed

```bash
dotnet run
```

### Run It

On your Windows machine: select five items (Ctrl-click), pick a
category from the bulk dropdown, click "Bulk Set Category" — all five
rows update to the new category immediately, in one visible batch, not
one at a time with a visible pause between each. Select several items
and click "Bulk Delete" — one confirmation dialog names the real count;
confirming removes all of them at once. Fully quit and reopen the app:
every bulk change persisted correctly.

### Connection

Epic 11's bulk actions are real, fast, and correctly batched. The next
lesson adds a genuinely different interaction style — drag-and-drop —
as a real alternative to menus and buttons for one specific action.

---

## Closing

### Connect the Pieces

Selecting several rows populates `viewModel.SelectedItems` (Lesson 42,
already correct); clicking "Bulk Set Category" or "Bulk Delete" opens
one real `SqliteTransaction` — the exact mechanism this lesson's own
first unit measured at roughly 146× faster than letting each row
auto-commit separately — and iterates `SelectedItems` once, running one
real database statement per item inside that single transaction, then
commits everything together in one real, atomic step.

### What Breaks Without This

Temporarily remove `command.Transaction = transaction;` from
`BulkSetCategory`'s loop (leaving `BeginTransaction()`/`Commit()` in
place, but no longer actually attaching any command to that
transaction). Select a large number of items (30 or more, to make the
timing difference actually visible) and click "Bulk Set Category".
Real, representative result: the operation still works correctly — every
selected item's category still updates — but noticeably slower, because
every individual `UPDATE`, no longer actually part of the transaction,
silently falls back to auto-commit, paying the same per-statement cost
this lesson's first unit measured directly. Nothing errors; the
`transaction.Commit()` call still "succeeds," committing a transaction
that, in practice, contains nothing. Restore the real
`command.Transaction = transaction;` line afterward.

### Exercises

- In the `lab-transaction` throwaway pattern, increase the row count
  from 200 to 2,000 and re-measure both approaches — confirm, with real
  output, whether the *ratio* between auto-commit and transactional
  timing stays roughly the same or changes.
- Predict, in your own words, what would happen if an exception were
  thrown partway through `BulkDelete`'s `foreach` loop, *before*
  `transaction.Commit()` runs — would already-processed items inside
  the loop stay deleted in the database? Reason from this lesson's own
  rollback proof before testing it (by temporarily throwing a real
  exception partway through a throwaway version of the loop).
- Add a "Bulk Archive" button, reusing `ArchiveItem`'s own logic
  (Lesson 28) inside the same one-transaction-per-batch pattern this
  lesson just established for delete.

### Definition of Done

- [ ] Bulk Set Category updates every selected item's category in one
      real database transaction.
- [ ] Bulk Delete removes every selected item with exactly one
      confirmation dialog, in one real transaction.
- [ ] Both buttons disable themselves automatically when nothing is
      selected.
- [ ] You reproduced the accidentally-untransacted-loop regression on
      purpose, confirmed it still works but loses the real performance
      benefit, and restored the correct `command.Transaction` assignment.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add transactional bulk edit and bulk delete — proven ~146x faster than per-row auto-commit"`.
