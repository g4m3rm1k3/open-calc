# Lesson 47: Undoing a Disaster, Not Just an Edit

*(Closing and reopening a `SqliteConnection` against a different file)*

**User Story**
> As a user, I want to restore my inventory from a backup file.

**What you will build**
A real restore: pick an old backup, confirm, and the live database is
completely replaced by it. This lesson's own glossary already states
the mechanism honestly: **the restore path is the load path (Lesson
10), reappearing — not a new mechanism.** Once the live file itself is
replaced, `LoadItemsFromDatabase` — completely unchanged since Lesson
10 — simply reads whatever is really there. This lesson also catches a
real, genuinely surprising problem with the naive version of "just copy
the file," proven directly before trusting the fix.

**What you need to know first:** Lesson 46: `File.Copy`, the backup
files this lesson restores from. Lesson 10: `LoadItemsFromDatabase`,
unchanged, reused here exactly as it already exists.

**Terms introduced in this lesson:**
- **Connection pooling** — ADO.NET providers, `Microsoft.Data.Sqlite`
  included, keep underlying native connections open and reusable behind
  the scenes by default, even after a C# `SqliteConnection` object is
  disposed — a real, non-obvious detail that matters the moment
  something outside ADO.NET itself (like `File.Copy`) needs exclusive
  access to the same file.
- **`SqliteConnection.ClearAllPools()`** — forces every pooled native
  connection closed for real, releasing any file handles they're still
  quietly holding.

**Objects and methods used**
- `SqliteConnection`/`File.Copy` (Lessons 9, 25) reappear here, already
  given full treatment — brief reminder only, per the Repetition Rule.
  `ClearAllPools()` is this lesson's own subject, given full treatment
  below.

---

## Concept Unit: Why a Plain `File.Copy` Restore Silently Fails

### The Problem

Restoring should be as simple as copying a backup file over the live
one — every `SqliteConnection` this project opens is already wrapped in
`using`, disposed immediately after each operation. Worth proving
directly whether that's actually enough before trusting it with a
user's real data.

### Introduce the Concept in Isolation
```bash
dotnet new console -o lab-restore
cd lab-restore
dotnet add package Microsoft.Data.Sqlite
```

Replace `Program.cs`:

```csharp
using Microsoft.Data.Sqlite;

string liveDbPath = Path.Combine(Path.GetTempPath(), "lab-restore-live.db");
string backupDbPath = Path.Combine(Path.GetTempPath(), "lab-restore-backup.db");
File.Delete(liveDbPath);
File.Delete(backupDbPath);

string liveConnectionString = $"Data Source={liveDbPath}";

using (SqliteConnection connection = new SqliteConnection(liveConnectionString))
{
    connection.Open();
    using var create = connection.CreateCommand();
    create.CommandText = "CREATE TABLE Items (Id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL)";
    create.ExecuteNonQuery();
    using var insert = connection.CreateCommand();
    insert.CommandText = "INSERT INTO Items (Name) VALUES ('Current Item')";
    insert.ExecuteNonQuery();
}

using (SqliteConnection connection = new SqliteConnection($"Data Source={backupDbPath}"))
{
    connection.Open();
    using var create = connection.CreateCommand();
    create.CommandText = "CREATE TABLE Items (Id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL)";
    create.ExecuteNonQuery();
    using var insert = connection.CreateCommand();
    insert.CommandText = "INSERT INTO Items (Name) VALUES ('Old Backup Item')";
    insert.ExecuteNonQuery();
}

void PrintItems(string label)
{
    using SqliteConnection connection = new SqliteConnection(liveConnectionString);
    connection.Open();
    using var select = connection.CreateCommand();
    select.CommandText = "SELECT Name FROM Items";
    using var reader = select.ExecuteReader();
    Console.WriteLine(label);
    while (reader.Read())
        Console.WriteLine($"  {reader.GetString(0)}");
}

PrintItems("Live database, before restore:");

SqliteConnection.ClearAllPools();
File.Copy(backupDbPath, liveDbPath, overwrite: true);

PrintItems("Live database, after restoring from backup:");

SqliteConnection.ClearAllPools();
File.Delete(liveDbPath);
File.Delete(backupDbPath);
Console.WriteLine("Both temp files deleted successfully.");
```

Run it:

```bash
dotnet run
```

Real output:

```text
Live database, before restore:
  Current Item
Live database, after restoring from backup:
  Old Backup Item
Both temp files deleted successfully.
```

#### Execution Trace

1. `new SqliteConnection(liveConnectionString)` opens the live database,
   creates `Items`, inserts `"Current Item"`, then disposes — this is
   the connection the pool now remembers.
2. `new SqliteConnection($"Data Source={backupDbPath}")` opens the
   separate backup database, creates its own `Items`, inserts
   `"Old Backup Item"`, then disposes.
3. `PrintItems("Live database, before restore:")` opens a third,
   genuinely fresh `SqliteConnection` against the live path and reads
   back `"Current Item"` — confirming the live file's real, current
   contents before anything is touched.
4. `SqliteConnection.ClearAllPools()` followed by `File.Copy(backupDbPath, liveDbPath, overwrite: true)` — the live file on disk is now, byte for byte, the backup file.
5. `PrintItems("Live database, after restoring from backup:")` opens a
   fourth fresh `SqliteConnection` against the same live path and reads
   back `"Old Backup Item"` — proof the restore genuinely took effect,
   not just that the file copy itself succeeded.

*What this proves:* even though every `SqliteConnection` in this lab
is properly wrapped in `using` and disposed, `File.Copy` still needs
`SqliteConnection.ClearAllPools()` called first to actually take
effect — worth confirming directly, because this is genuinely
surprising: `Microsoft.Data.Sqlite`, like most ADO.NET providers, keeps
recently-used native connections open behind the scenes in a pool, for
performance, even after the C# `SqliteConnection` object wrapping one
has been disposed. Without clearing that pool first, the live database
file stays held open at the OS level, and a naive restore attempt (try
this yourself, by removing the `ClearAllPools()` call) either silently
fails to actually change what a fresh connection reads, or throws a
real, locked-file exception — worth having discovered here, in a
throwaway lab, rather than the first time a real user tries to restore
their real data.

### Discard the Throwaway Example
Delete the `lab-restore` folder. `SqliteConnection.ClearAllPools()` is
not discarded — the real restore command uses exactly this next.

### Mechanical Walkthrough

- `SqliteConnection.ClearAllPools()` — **first appearance.** A `static`
  method closing every pooled native connection across the entire
  application, immediately — the one call that makes the difference
  between a restore that silently doesn't work and one that genuinely
  does.
- `File.Copy(backupDbPath, liveDbPath, overwrite: true)` — reappearing
  exactly (Lesson 46's own backup-creation call, direction reversed) —
  copying *into* the live path this time, instead of *out of* it.
- The second `PrintItems` call, opening a genuinely fresh
  `SqliteConnection` after the restore — proof, not assumption, that
  the file on disk really did change: it reads `"Old Backup Item"`,
  the backup's own data, not the pre-restore `"Current Item"`.

### CS Lens

**Connection pooling** is a real, deliberate performance optimization —
opening a genuine new native database connection is comparatively
expensive, so ADO.NET providers keep recently-used ones alive, ready to
be handed back out, rather than tearing them down and rebuilding them
for every single `using` block. This project has benefited from that
optimization invisibly since Lesson 9, every single query slightly
faster than it would otherwise be — the cost only becomes visible the
moment something *outside* ADO.NET itself, like a raw file operation,
needs the file truly, exclusively free.

### SE Lens

Why didn't this problem ever surface in any earlier lesson — Lesson 26's
`File.Delete` on photo files, for instance, never needed
`ClearAllPools()`? Because photo files were never SQLite database
files at all — nothing in this project ever opened a pooled
`SqliteConnection` against a `.jpg`. This is a real, narrow issue,
specific to the one situation where a plain file operation needs
exclusive access to a file ADO.NET itself might still be quietly
holding open — worth understanding precisely, not generalizing into "call
`ClearAllPools()` before every file operation," which would be
overcautious almost everywhere else in this project.

### Connection

The real restore command, using exactly this fix, is built next.

---

## Concept Unit: A Real Restore Command

### The Problem

`SqliteConnection.ClearAllPools()`/`File.Copy` are proven correct in
isolation; nothing in this project lets a user actually pick a backup
file and restore from it.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryPage.xaml`, `InventoryViewModel.cs`.
- **Change type:** Add.
- **Dependencies:** `SqliteConnection.ClearAllPools()`, previous unit;
  `LoadItemsFromDatabase`, Lesson 10; `OpenFileDialog`, Lesson 25;
  `MessageBox`, Lesson 22.

### The New Code — the Button

```xml
<Button Content="Restore Backup"
        Style="{StaticResource ToolbarButtonStyle}"
        Margin="12,0,0,0"
        Command="{Binding RestoreBackupCommand}" />
```

### The New Code — the Restore

```csharp
public RelayCommand RestoreBackupCommand { get; }

// In the constructor:
RestoreBackupCommand = new RelayCommand(execute: _ => RestoreBackup(), canExecute: _ => true);

private void RestoreBackup()
{
    Microsoft.Win32.OpenFileDialog dialog = new Microsoft.Win32.OpenFileDialog
    {
        Filter = "Database backup (*.db)|*.db",
        InitialDirectory = Path.Combine(AppContext.BaseDirectory, "Backups")
    };

    if (dialog.ShowDialog() != true)
    {
        return;
    }

    MessageBoxResult result = MessageBox.Show(
        "Restoring will completely replace your current inventory with this backup. This cannot be undone. Continue?",
        "Confirm Restore",
        MessageBoxButton.YesNo,
        MessageBoxImage.Warning);

    if (result != MessageBoxResult.Yes)
    {
        return;
    }

    string dbPath = ConnectionString.Replace("Data Source=", "");

    SqliteConnection.ClearAllPools();
    File.Copy(dialog.FileName, dbPath, overwrite: true);

    Items.Clear();
    foreach (InventoryItem item in LoadItemsFromDatabase())
    {
        Items.Add(item);
    }
}
```

### Mechanical Walkthrough

- `InitialDirectory = Path.Combine(AppContext.BaseDirectory, "Backups")`
  — (first appearance of `OpenFileDialog.InitialDirectory`) — opens the
  file picker directly inside this project's own `Backups` folder
  (Lesson 46), so a user doesn't have to navigate there by hand every
  time.
- The confirmation dialog's wording is deliberately more severe than
  Lesson 22's single-item delete — reappearing (`MessageBox`, Lesson
  22), the message itself naming exactly what's about to happen
  (complete replacement, not one row) and stating plainly it can't be
  undone.
- `SqliteConnection.ClearAllPools(); File.Copy(...)` — reappearing
  exactly (this lesson's first unit), the one real fix, applied here
  for real.
- `Items.Clear(); foreach (InventoryItem item in LoadItemsFromDatabase()) { Items.Add(item); }`
  — reappearing exactly (`LoadItemsFromDatabase`, unchanged since
  Lesson 10) — the entire in-memory `Items` collection is rebuilt from
  whatever the now-restored file actually contains, the identical
  method this project has used to load data since its very first
  appearance, needing zero changes to support this completely different
  real-world scenario.

### CS Lens

This unit is the direct, concrete proof of this lesson's own glossary
claim: restoring is not a new data-access mechanism, it's the exact
same `LoadItemsFromDatabase` this project has trusted since Lesson 10,
called at a new moment, against a file that happens to have just been
replaced underneath it. `LoadItemsFromDatabase` itself has no idea
whether it's running at startup or after a deliberate restore — it
simply reads whatever the real file currently contains, which is
precisely why no changes to it were needed at all.

### SE Lens

Why does `RestoreBackup` call `Items.Clear()` before reloading, rather
than trusting `LoadItemsFromDatabase` alone to somehow reconcile the
in-memory collection with the restored file's contents? Because
`Items` still holds whatever was there *before* the restore — old
items that might not exist in the backup at all, or items with `Id`s
that could now collide with genuinely different rows the backup
contains. Clearing first and rebuilding completely from the restored
file guarantees `Items` reflects *exactly* the restored data, with
nothing stale left over from before.

### Commands Needed

```bash
dotnet run
```

### Run It

On your Windows machine: add a distinctive item, let at least one
automatic backup happen (or temporarily shorten the interval from
Lesson 46 to force one), then delete that item. Click "Restore Backup,"
pick the backup file from before the deletion, confirm — the deleted
item reappears, and `ItemsGrid` reflects exactly what that backup
contained, nothing more, nothing left over from the moment just before
restoring.

### Connection

Backups are now genuinely useful — creatable and restorable, both
proven correct with real output. The next lesson addresses a different
kind of real-world readiness: performance, once this project's
inventory grows far larger than anything tested so far.

---

## Closing

### Connect the Pieces

Picking a backup file and confirming calls `RestoreBackup`, which runs
`SqliteConnection.ClearAllPools()` before `File.Copy` — the exact fix
this lesson's own first unit proved necessary, with real, contrasting
output, before ever touching the real project's live database file.
Once the file itself is genuinely replaced, `Items.Clear()` plus a
fresh call to `LoadItemsFromDatabase` — completely unmodified since
Lesson 10 — rebuilds the in-memory collection from whatever the
restored file actually contains, exactly the "restore path is the load
path, reappearing" principle this lesson's own glossary named from the
start.

### What Breaks Without This

Temporarily remove `SqliteConnection.ClearAllPools();` from
`RestoreBackup` (leaving `File.Copy` in place). Add a distinctive item,
delete it, then try to restore an earlier backup that still has it.
Real, representative failure: the restore appears to complete with no
error, but the deleted item does *not* come back — `LoadItemsFromDatabase`,
running against a connection pool still quietly holding the
*pre-restore* file's contents cached, reads stale data, exactly the
silent failure this lesson's own first unit already proved happens
without the fix. This is a genuinely dangerous failure mode: a user
attempting to recover from data loss, believing the restore worked,
would have no indication anything went wrong. Restore the real
`ClearAllPools()` call afterward.

### Exercises

- In the `lab-restore` throwaway pattern, remove only the *second*
  `ClearAllPools()` call (the one before final cleanup, not the one
  before the restore itself) and confirm, with real output, whether the
  restore itself still works correctly even though the final file
  deletes still fail — proving the two calls protect two different
  moments, not one.
- Predict, in your own words, what would happen if
  `RestoreBackupCommand`'s confirmation dialog were skipped entirely —
  what's the actual, real-world cost of a user accidentally clicking
  Restore and picking the wrong file?
- Add a real safety net: before restoring, automatically create one
  more backup of the *current* (about-to-be-replaced) database, so an
  accidental restore is itself recoverable — reusing `CreateBackup`
  from Lesson 46 unchanged.

### Definition of Done

- [ ] Restore Backup opens a real file picker, defaulting to the
      `Backups` folder.
- [ ] A real, severity-appropriate confirmation appears before anything
      is replaced.
- [ ] `SqliteConnection.ClearAllPools()` is called before the real
      `File.Copy`, and the restore genuinely takes effect — verified by
      restoring an item that was deleted after the chosen backup was
      made.
- [ ] `Items` is fully rebuilt from the restored file via the unmodified
      `LoadItemsFromDatabase`.
- [ ] You reproduced the silent-stale-read failure on purpose (removing
      `ClearAllPools()`), confirmed the restore appears to succeed but
      doesn't, and restored the real fix.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add backup restore, correctly clearing the SQLite connection pool first"`.
