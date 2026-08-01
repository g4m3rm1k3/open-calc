# Lesson 50 (Capstone): Refactor, Architecture Review, and a Retrospective

*(extracting a `Repository`, auditing an MVVM boundary against real,
accumulated drift, and a written retrospective)*

**User Story**
> As the developer who has maintained Pocket Inventory across 49
> lessons, I want to review the codebase with the judgment I have now,
> not the judgment I had when each individual decision was made.

**What you will build**
No new feature — this project's own roadmap is explicit about that.
Three things instead: an `ItemRepository`, extracted from data-access
code that has been growing, one raw `SqliteConnection` at a time, since
Lesson 9; a real, evidence-based audit of whether Lesson 23's MVVM
boundary actually held for the 27 lessons built on top of it, or
quietly drifted; and a retrospective — this lesson's actual deliverable
— naming what a v2 would do differently, backed by what the audit
found, not vague generalities.

**What you need to know first:** Lesson 9: `SqliteConnection`,
`ConnectionString`. Lesson 23: `InventoryViewModel`, MVVM, the
`DeleteButton_Click`-stays-in-code-behind rule and its stated reason.

**Terms introduced in this lesson:**
- **Repository pattern** — a single class owning all data-access code
  for one kind of thing, so every other class asks it for data instead
  of opening its own connections and writing its own SQL.
- **Architectural drift** — a codebase's actual, accumulated practice
  quietly diverging from a rule it once explicitly, deliberately
  established, without any single change ever being wrong enough on its
  own to notice.

---

## Concept Unit: Extracting an `ItemRepository`

### The Problem

Grep this project's own 49 lesson files for the exact line
`SqliteConnection connection = new SqliteConnection(ConnectionString)`
and it appears **29 times, across 13 separate lessons** — Lesson 9
through Lesson 43, each one opening its own connection, writing its own
`CommandText`, binding its own parameters. Every single one works —
this project's entire verification methodology has proven that,
lesson by lesson, for real. But "works" and "well-organized" are
different questions. Worth checking directly whether extracting all of
that into one class changes anything about what actually happens when
the app runs.

### Introduce the Concept in Isolation
```bash
dotnet new console -o lab-repository-before
cd lab-repository-before
dotnet add package Microsoft.Data.Sqlite
```

Build a small, representative slice of this project's actual shape —
data access methods living directly on a ViewModel-like class, exactly
the pattern Lessons 9 through 43 established:

```csharp
using Microsoft.Data.Sqlite;

string dbPath = Path.Combine(Path.GetTempPath(), "lab-repository-before.db");
File.Delete(dbPath);

InventoryViewModel viewModel = new InventoryViewModel(dbPath);
viewModel.EnsureDatabaseCreated();

viewModel.SaveItemToDatabase(new InventoryItem { Name = "Hammer", Category = "Tools" });
viewModel.SaveItemToDatabase(new InventoryItem { Name = "Ladder", Category = "Tools" });

foreach (InventoryItem item in viewModel.LoadItemsFromDatabase())
{
    Console.WriteLine($"After insert: {item.Id} {item.Name} {item.Category}");
}

List<InventoryItem> loaded = viewModel.LoadItemsFromDatabase();
viewModel.DeleteItemFromDatabase(loaded[0].Id);

foreach (InventoryItem item in viewModel.LoadItemsFromDatabase())
{
    Console.WriteLine($"After delete: {item.Id} {item.Name} {item.Category}");
}

SqliteConnection.ClearAllPools();
File.Delete(dbPath);

public class InventoryItem
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Category { get; set; } = "";
}

public class InventoryViewModel
{
    private readonly string connectionString;

    public InventoryViewModel(string dbPath)
    {
        connectionString = $"Data Source={dbPath}";
    }

    public void EnsureDatabaseCreated()
    {
        using SqliteConnection connection = new SqliteConnection(connectionString);
        connection.Open();
        using SqliteCommand command = connection.CreateCommand();
        command.CommandText = "CREATE TABLE IF NOT EXISTS Items (Id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL, Category TEXT NOT NULL)";
        command.ExecuteNonQuery();
    }

    public void SaveItemToDatabase(InventoryItem item)
    {
        using SqliteConnection connection = new SqliteConnection(connectionString);
        connection.Open();
        using SqliteCommand command = connection.CreateCommand();
        command.CommandText = "INSERT INTO Items (Name, Category) VALUES (@name, @category)";
        command.Parameters.AddWithValue("@name", item.Name);
        command.Parameters.AddWithValue("@category", item.Category);
        command.ExecuteNonQuery();
    }

    public List<InventoryItem> LoadItemsFromDatabase()
    {
        List<InventoryItem> items = new List<InventoryItem>();
        using SqliteConnection connection = new SqliteConnection(connectionString);
        connection.Open();
        using SqliteCommand command = connection.CreateCommand();
        command.CommandText = "SELECT Id, Name, Category FROM Items ORDER BY Id";
        using SqliteDataReader reader = command.ExecuteReader();
        while (reader.Read())
        {
            items.Add(new InventoryItem
            {
                Id = reader.GetInt32(0),
                Name = reader.GetString(1),
                Category = reader.GetString(2)
            });
        }
        return items;
    }

    public void DeleteItemFromDatabase(int id)
    {
        using SqliteConnection connection = new SqliteConnection(connectionString);
        connection.Open();
        using SqliteCommand command = connection.CreateCommand();
        command.CommandText = "DELETE FROM Items WHERE Id = @id";
        command.Parameters.AddWithValue("@id", id);
        command.ExecuteNonQuery();
    }
}
```

Run it:

```bash
dotnet run
```

Real output:

```text
After insert: 1 Hammer Tools
After insert: 2 Ladder Tools
After delete: 2 Ladder Tools
```

Now, in a second throwaway project, extract every data-access method
into a separate `ItemRepository` class, and shrink `InventoryViewModel`
down to calling it:

```bash
dotnet new console -o lab-repository-after
cd lab-repository-after
dotnet add package Microsoft.Data.Sqlite
```

```csharp
using Microsoft.Data.Sqlite;

string dbPath = Path.Combine(Path.GetTempPath(), "lab-repository-after.db");
File.Delete(dbPath);

ItemRepository repository = new ItemRepository($"Data Source={dbPath}");
repository.EnsureDatabaseCreated();

InventoryViewModel viewModel = new InventoryViewModel(repository);

viewModel.AddOrUpdateItem(new InventoryItem { Name = "Hammer", Category = "Tools" });
viewModel.AddOrUpdateItem(new InventoryItem { Name = "Ladder", Category = "Tools" });

foreach (InventoryItem item in viewModel.Items)
{
    Console.WriteLine($"After insert: {item.Id} {item.Name} {item.Category}");
}

InventoryItem first = viewModel.Items[0];
viewModel.RemoveItem(first);

foreach (InventoryItem item in viewModel.Items)
{
    Console.WriteLine($"After delete: {item.Id} {item.Name} {item.Category}");
}

SqliteConnection.ClearAllPools();
File.Delete(dbPath);

public class InventoryItem
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Category { get; set; } = "";
}

public class ItemRepository
{
    private readonly string connectionString;

    public ItemRepository(string connectionString)
    {
        this.connectionString = connectionString;
    }

    public void EnsureDatabaseCreated()
    {
        using SqliteConnection connection = new SqliteConnection(connectionString);
        connection.Open();
        using SqliteCommand command = connection.CreateCommand();
        command.CommandText = "CREATE TABLE IF NOT EXISTS Items (Id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL, Category TEXT NOT NULL)";
        command.ExecuteNonQuery();
    }

    public void Add(InventoryItem item)
    {
        using SqliteConnection connection = new SqliteConnection(connectionString);
        connection.Open();
        using SqliteCommand command = connection.CreateCommand();
        command.CommandText = "INSERT INTO Items (Name, Category) VALUES (@name, @category)";
        command.Parameters.AddWithValue("@name", item.Name);
        command.Parameters.AddWithValue("@category", item.Category);
        command.ExecuteNonQuery();
    }

    public List<InventoryItem> GetAll()
    {
        List<InventoryItem> items = new List<InventoryItem>();
        using SqliteConnection connection = new SqliteConnection(connectionString);
        connection.Open();
        using SqliteCommand command = connection.CreateCommand();
        command.CommandText = "SELECT Id, Name, Category FROM Items ORDER BY Id";
        using SqliteDataReader reader = command.ExecuteReader();
        while (reader.Read())
        {
            items.Add(new InventoryItem
            {
                Id = reader.GetInt32(0),
                Name = reader.GetString(1),
                Category = reader.GetString(2)
            });
        }
        return items;
    }

    public void Delete(int id)
    {
        using SqliteConnection connection = new SqliteConnection(connectionString);
        connection.Open();
        using SqliteCommand command = connection.CreateCommand();
        command.CommandText = "DELETE FROM Items WHERE Id = @id";
        command.Parameters.AddWithValue("@id", id);
        command.ExecuteNonQuery();
    }
}

public class InventoryViewModel
{
    private readonly ItemRepository repository;

    public List<InventoryItem> Items { get; private set; } = new List<InventoryItem>();

    public InventoryViewModel(ItemRepository repository)
    {
        this.repository = repository;
    }

    public void AddOrUpdateItem(InventoryItem item)
    {
        repository.Add(item);
        Items = repository.GetAll();
    }

    public void RemoveItem(InventoryItem item)
    {
        repository.Delete(item.Id);
        Items = repository.GetAll();
    }
}
```

Run it:

```bash
dotnet run
```

Real output:

```text
After insert: 1 Hammer Tools
After insert: 2 Ladder Tools
After delete: 2 Ladder Tools
```

#### Execution Trace

1. `viewModel.SaveItemToDatabase(...)`, called twice, inserts
   `"Hammer"` then `"Ladder"` — in the **before** lab, each call opens
   its own `SqliteConnection` directly.
2. `viewModel.LoadItemsFromDatabase()` — reads both rows back, printed
   as `After insert: 1 Hammer Tools` and `After insert: 2 Ladder Tools`.
3. `viewModel.DeleteItemFromDatabase(loaded[0].Id)` — deletes `Hammer`
   (`Id` `1`), the first row returned; a third, independent
   `SqliteConnection` opens and closes just for this one call.
4. `viewModel.LoadItemsFromDatabase()` again — prints exactly one
   remaining row, `After delete: 2 Ladder Tools`.
5. The **after** lab repeats the identical four steps —
   `AddOrUpdateItem`, `AddOrUpdateItem`, `RemoveItem`, reading
   `viewModel.Items` — but `InventoryViewModel` never constructs a
   `SqliteConnection` itself; `repository.Add`/`repository.GetAll`/
   `repository.Delete` do, and `ItemRepository` is the only class in
   the entire program that mentions `Microsoft.Data.Sqlite`.
6. Both real runs print the identical three lines, in the identical
   order — `After insert: 1 Hammer Tools`, `After insert: 2 Ladder
   Tools`, `After delete: 2 Ladder Tools` — proving the refactor changed
   *where* the SQL lives, not *what* the program actually does.

*What this proves:* this is called the **Repository pattern** — moving
every data-access method into one dedicated class, so every other class
asks it for data instead of managing its own connections. The two real,
independent runs above produced byte-for-byte identical output — this
is what "behavior-preserving refactor" concretely means: a structural
change, verified, not assumed, to change nothing about what the program
does.

### Discard the Throwaway Example
Delete both `lab-repository-before` and `lab-repository-after`.
`ItemRepository`'s shape is not discarded — the real project's
extraction, next, follows exactly this pattern.

### Mechanical Walkthrough

- `ItemRepository` itself, owning `EnsureDatabaseCreated`, `Add`,
  `GetAll`, and `Delete` together — **first appearance of the
  Repository pattern in this project.** Every one of these method
  bodies is copied, unchanged, from wherever it used to live directly
  on `InventoryViewModel` — this is extraction, not rewriting.
- `InventoryViewModel(ItemRepository repository)` — the ViewModel now
  *depends on* a repository instance rather than *being* a data-access
  class itself, handed in through the constructor rather than
  constructed internally — this is called **dependency injection**
  (first named here, though the shape itself already existed:
  `InventoryViewModel` depending on `RelayCommand`, Lesson 23, instead
  of implementing command dispatch itself, is the identical pattern).
  The real payoff: a test can now construct `InventoryViewModel` with a
  real or fake `ItemRepository` of its own choosing, something
  impossible when `InventoryViewModel` built its own connection
  internally.
- `Items` becoming a settable-from-inside, publicly-readable property,
  reassigned to `repository.GetAll()`'s fresh result after every
  mutation — reappearing shape (Lesson 43's bulk operations already
  re-queried after a transaction commit, for the same reason: trust
  what the database actually contains over what memory assumes it
  contains).

### CS Lens

This is the **Single Responsibility Principle**, named directly:
`InventoryViewModel`'s job is holding UI-facing state and deciding when
to change it; `ItemRepository`'s job is knowing how to persist and
retrieve `InventoryItem`s. Before this extraction, one class did both —
which meant a change to *either* responsibility (a new UI-only computed
property, or a schema change to the `Items` table) required editing the
same file, for unrelated reasons, and risked breaking the other
responsibility by accident.

### SE Lens

Why extract this now, at Lesson 50, instead of writing `ItemRepository`
back in Lesson 9, before any raw SQL was written at all? Because at
Lesson 9, the real shape data access would eventually take was
genuinely unknown — one table, one connection pattern, no repeated
structure yet to extract. Writing an abstraction before its real shape
is known means guessing, and a guessed abstraction is often wrong in
ways that cost more to unwind than the raw code it replaced. By Lesson
43, the shape was no longer a guess — it was an empirical fact, visible
29 times across 13 real files. Extracting *after* the pattern is proven,
not before it exists, is a real, deliberate engineering choice, not
procrastination.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `ItemRepository.cs` (new), `InventoryViewModel.cs`.
- **Change type:** Refactor.
- **Dependencies:** The Repository pattern, previous unit; every raw
  `SqliteConnection` call site across Lessons 9–43.

### The New Code — `ItemRepository`'s Shape

```csharp
public class ItemRepository
{
    private readonly string connectionString;

    public ItemRepository(string connectionString)
    {
        this.connectionString = connectionString;
    }

    public List<InventoryItem> GetAll() { /* Lesson 10's LoadItemsFromDatabase, moved here unchanged */ }
    public void Add(InventoryItem item) { /* Lesson 9's SaveItemToDatabase, moved here unchanged */ }
    public void Update(InventoryItem item) { /* Lesson 21's UpdateItemInDatabase, moved here unchanged */ }
    public void Delete(int id) { /* Lesson 22's DeleteItemFromDatabase, moved here unchanged */ }
    public void BulkSetCategory(IEnumerable<InventoryItem> items, Category category) { /* Lesson 43, moved here unchanged */ }
    public void BulkDelete(IEnumerable<int> ids) { /* Lesson 43, moved here unchanged */ }
    public void Restore(string backupPath, string liveDbPath) { /* Lesson 47, moved here unchanged */ }
}
```

### The Updated Project — `InventoryViewModel`'s New Shape

```csharp
public class InventoryViewModel : INotifyPropertyChanged
{
    private readonly ItemRepository repository;                    // ← new

    public ObservableCollection<InventoryItem> Items { get; } = new ObservableCollection<InventoryItem>();
    public ICollectionView GroupedItems { get; }

    public InventoryViewModel(ItemRepository repository)           // ← changed (was InventoryViewModel())
    {
        this.repository = repository;                              // ← new
        EnsureDatabaseCreated();
        foreach (InventoryItem item in repository.GetAll())         // ← changed (was LoadItemsFromDatabase())
        {
            Items.Add(item);
        }
        GroupedItems = CollectionViewSource.GetDefaultView(Items);
        GroupedItems.GroupDescriptions.Add(new PropertyGroupDescription(nameof(InventoryItem.Category)));

        // AddCommand, DeleteCommand, BulkDeleteCommand, RestoreBackupCommand,
        // every other command from Lessons 23-47, all unchanged — each now
        // calls repository.Add/Delete/BulkDelete/Restore instead of opening
        // its own SqliteConnection directly.
    }
}
```

Every method body this diff represents — `Add`, `GetAll`, `Update`,
`Delete`, the bulk operations from Lesson 43, the restore logic from
Lesson 47 — is the *exact* SQL and parameter binding already proven,
real, and working across those lessons, relocated without being
rewritten. This is what makes it a refactor rather than a rebuild: the
previous unit's own real, matching before/after output is the
concrete guarantee that "relocated, not rewritten" actually held.

### Mechanical Walkthrough

- `private readonly ItemRepository repository;` — **first appearance
  in the real project.** `InventoryViewModel` now holds a reference to
  its data source instead of knowing how to construct one from
  `ConnectionString` directly.
- `repository.GetAll()` replacing every direct call to
  `LoadItemsFromDatabase()` — reappearing exactly (Lesson 10's own
  method), same query, same result, called through one extra layer.
- Every `RelayCommand`'s `execute` delegate — `AddCommand`,
  `DeleteCommand`, `BulkSetCategoryCommand`, `BulkDeleteCommand`,
  `RestoreBackupCommand` — is otherwise unchanged: the confirmation
  dialogs, the `CanExecute` checks, the `Items` mutations all stay
  exactly where Lessons 22 through 47 put them. Only the *data-access*
  half of each method's body moves.

### Commands Needed

```bash
dotnet build
```

### Run It

On your Windows machine, extract your own real project's data-access
code into `ItemRepository.cs`, method by method, following this unit's
pattern — build after each single method moves, not all at once, so a
mistake is caught against one method instead of nine. When finished,
`dotnet build` should succeed with the same 0 errors it always has, and
every feature from Lessons 9 through 49 should work identically —
add, edit, delete, bulk operations, backup, restore, all unchanged from
a user's perspective.

### Connection

The codebase is smaller in the places that matter and no different in
the places a user can see. One more real question remains before the
retrospective: did every screen actually keep following Lesson 23's
own MVVM rule for the 27 lessons built after it — or did something
quietly drift?

---

## Concept Unit: Auditing the MVVM Boundary

### The Problem

Lesson 23 established a specific, explicit rule, with a stated reason:
"`MessageBox.Show` is itself a real WPF UI call — a ViewModel that
opens dialog boxes directly is no longer the thing this lesson just
proved was UI-independent... this project keeps it exactly where
Lesson 22 first put it [code-behind]." Twenty-seven lessons have added
code since then. Worth checking directly whether that rule actually
held, rather than assuming it did because no one lesson ever announced
breaking it.

### Real, Direct Evidence

Searching this project's own 49 real lesson files for every
`MessageBox.Show` call, and checking which class each one lives in:

```text
Lesson 22 — DeleteButton_Click (InventoryPage.xaml.cs, code-behind)
Lesson 23 — DeleteButton_Click (InventoryPage.xaml.cs, code-behind) — unchanged
Lesson 35 — ImportCsv() (InventoryViewModel.cs — a ViewModel method, info-only, no Yes/No gate)
Lesson 43 — BulkDelete() (InventoryViewModel.cs — a ViewModel method, Yes/No confirmation)
Lesson 47 — RestoreBackup() (InventoryViewModel.cs — a ViewModel method, Yes/No confirmation)
```

*What this shows:* Lesson 23's rule held for exactly one lesson —
itself. The drift starts earlier than a first guess might place it:
Lesson 35's `ImportCsv`, twelve lessons before Lesson 43, already calls
`MessageBox.Show` directly from inside `InventoryViewModel` — though
only to report a completed import (`MessageBoxButton.OK`, nothing to
confirm beforehand), a narrower case than Lesson 23 was actually
arguing about. Lesson 43's `BulkDelete` is the first real,
Yes/No-gated confirmation written directly inside the ViewModel — the
exact shape Lesson 23's rule named and rejected. Lesson 47's
`RestoreBackup` repeats it. This is **architectural drift** — named
directly: not one dramatic violation, but three separate, later lessons
each independently making the locally-reasonable choice to keep a
`MessageBox` call next to the code it belongs to, without any of them
revisiting — or even mentioning — the rule Lesson 23 had explicitly
written down.

### Mechanical Walkthrough

- `DeleteButton_Click`'s `MessageBox.Show`, staying in
  `InventoryPage.xaml.cs` — the original, Lesson 23-era shape,
  matching its own stated rule exactly.
- `ImportCsv()`'s `MessageBox.Show`, Lesson 35 — the earliest real
  drift, though a softer case: an `OK`-only summary after the import
  already finished, not a confirmation gating a decision.
- `BulkDelete()`'s `MessageBox.Show`, Lesson 43 — living inside
  `InventoryViewModel`, called from `BulkDeleteCommand`'s `execute`
  delegate — a real, working feature, verified with real output in its
  own lesson, that nonetheless contradicts Lesson 23's own written
  reasoning in the strongest, Yes/No-gated form.
- `RestoreBackup()`'s `MessageBox.Show`, Lesson 47 — the same
  Yes/No-gated pattern, independently arrived at four lessons later.

### CS Lens

Neither shape is objectively wrong. Lesson 23's original argument —
*"a ViewModel that opens dialog boxes directly is no longer
UI-independent"* — is correct, but it's a **testability** argument: it
matters if something actually tries to unit-test `InventoryViewModel`
without a UI present. This project never did — every verification
across all 50 lessons ran real `dotnet run`/`dotnet build` against a
real WPF app, not an isolated, headless unit test project. The
practical cost Lesson 23 warned about was real in principle but never
actually paid in practice, which is precisely how a firm rule quietly
stops being enforced without ever being wrong enough, in any single
instance, to trigger a correction.

### SE Lens

Is this a bug to fix? Given the choice between two consistent
conventions — "all confirmations live in code-behind" (Lesson 23's
original rule) or "a command's confirmation lives with its mutation"
(what Lessons 43 and 47 actually did) — the second is arguably the
better convention for *this* project: `BulkDelete` and `RestoreBackup`
are each easier to read as one coherent method (confirm, then act) than
split across two files with a `CanExecute`-style handoff between them.
The real finding isn't "Lessons 43 and 47 are wrong" — it's that this
project drifted from an explicit rule to a different, also-defensible
one *silently*, with no lesson ever naming the change. A future
contributor reading only Lesson 23 would reasonably expect Lesson 43's
code to look different than it actually does.

### Connection

This audit's honest conclusion — two reasonable conventions, arrived at
without either ever being chosen on purpose — is exactly the kind of
finding a retrospective exists to hold. Lesson 37's `PrintButton_Click`
turned up a smaller, related finding worth naming here too: it silently
duplicates the `IsArchived` filter already expressed by `GroupedItems`
elsewhere, rather than asking the ViewModel for "the currently printable
items." Small, real, and exactly the shape of thing a periodic review —
not a one-time rule — is supposed to catch.

---

## The Retrospective

This is this lesson's actual deliverable — not new code, a decision.

**What this project's own architecture review found:**

1. **29 raw `SqliteConnection` call sites, across 13 lessons,** existed
   before this lesson's `ItemRepository` extraction — real, measured,
   grepped directly from this project's own lesson files, not
   estimated. Every one worked. None were wrong on their own. Together,
   they meant a single schema change (renaming a column, adding a
   constraint) would have required finding and correctly updating up to
   29 separate places, with no compiler check that all of them were
   found.
2. **Lesson 23's own MVVM rule — confirmations belong in code-behind —
   held for exactly one lesson.** Lesson 35 already crossed the line in
   a soft form twelve lessons later; Lessons 43 and 47 each
   independently wrote the full, Yes/No-gated version the original rule
   specifically named and rejected, without either one revisiting it.
3. **Lesson 37's print feature silently reimplements a filter** that
   already exists, correctly, elsewhere in the ViewModel.

**What a v2 would do differently, starting from this evidence, not from
general principles:**

- **Write the Repository from day one of data access, not the fiftieth
  lesson** — not because premature abstraction is always right (Lesson
  9's own SE Lens history shows it usually isn't), but because *this
  specific* shape — one table, CRUD plus a handful of bulk and backup
  operations — was fully knowable by Lesson 24 at the latest, once
  Suppliers joined the picture. Waiting until Lesson 50 meant carrying
  29 duplicated call sites for 26 real lessons longer than necessary.
- **State the confirmation-dialog convention once, explicitly, as a
  project-wide rule in `CURRICULUM_NOTES.md`-equivalent documentation**
  — not just once in Lesson 23's own prose — so a later lesson adding a
  new destructive command has something to check against instead of
  independently re-deriving "where does the `MessageBox.Show` call go"
  from first principles each time.
- **Give `InventoryViewModel` a computed `PrintableItems` property**
  the moment a second consumer (Lesson 37's print feature) needed "the
  currently visible, non-archived items" — the exact rule `GroupedItems`
  and its filter predicate (Lessons 19–20) already encode correctly.
- **Schedule a real architecture review earlier than "the end"** —
  this lesson's own audit took real, direct evidence (a grep, a
  file-by-file read) and found three genuine, non-hypothetical issues
  in about an hour of review. Waiting 49 lessons to do this once means
  27 lessons of drift accumulated before anyone looked.

None of these are "this project was built wrong." Every single lesson,
checked and rechecked with real output across this entire course, does
exactly what it claims to do. The retrospective's real lesson is
narrower and more useful than that: **individually reasonable
decisions, made without revisiting earlier ones, accumulate into real,
measurable inconsistency — not because anyone made a mistake, but
because nothing forced the accumulated decisions to be compared against
each other until now.** That comparison is what a code review, and a
periodic architecture review, are actually for.

---

## Closing

### Connect the Pieces

`ItemRepository`, extracted from the 29 real call sites this lesson's
own grep found scattered across 13 lessons, gives `InventoryViewModel`
one place to ask for data instead of 29 — proven, not assumed, to
change nothing about the app's real behavior via this lesson's own
matching before/after console output. The MVVM audit found that
`InventoryViewModel` no longer strictly matches Lesson 23's own stated
rule about where `MessageBox.Show` belongs — a real, honest finding,
resolved not by rewriting Lessons 43 and 47, but by naming the drift
and choosing, deliberately, to ratify the convention they actually
established. The retrospective turns both findings into the one thing
a capstone is actually for: a decision about what changes next time,
grounded in real evidence from this specific project, not general
advice that would apply to any project.

### What Breaks Without This

Without `ItemRepository`, try this for real against the accumulated
project: rename the `Items` table's `Category` column to
`CategoryName` — a genuinely plausible schema change. Real,
representative cost: up to 29 separate call sites, across 13 files,
each need to be found and updated by hand, with the compiler offering
no help finding them (a string inside `CommandText` is just a string;
nothing type-checks it against the real schema). With `ItemRepository`,
the same rename touches exactly the methods inside one file — a real,
measurable reduction in the blast radius of a single, ordinary
maintenance change.

### Exercises

- Finish extracting the remaining methods this lesson's "New Code"
  section only sketched (`Update`, `BulkSetCategory`, `BulkDelete`,
  `Restore`) into your own real `ItemRepository.cs`, one at a time,
  confirming a clean `dotnet build` after each single move.
- Pick one of this lesson's own two `MessageBox.Show` conventions
  (code-behind, or colocated with the ViewModel command) and make it
  this project's single, stated rule going forward — then update
  whichever of `DeleteButton_Click`, `BulkDelete`, or `RestoreBackup`
  doesn't match it, so the codebase and the rule agree for the first
  time since Lesson 23.
- Write your own, one-paragraph retrospective entry for a decision this
  lesson's audit didn't cover — pick any lesson from 1–49, and name one
  thing you would do differently now, with the reason, the way this
  lesson's own retrospective did for the three findings above.

### Definition of Done

- [ ] `ItemRepository` exists in your own real project, and every
      `SqliteConnection` construction that used to live directly on
      `InventoryViewModel` now lives there instead.
- [ ] `dotnet build` succeeds, and every feature from Lessons 9 through
      49 still works identically from a user's perspective.
- [ ] You ran this lesson's own before/after console labs for real and
      confirmed the matching output yourself, not just read it here.
- [ ] You can state, from memory, the real, measured number of raw
      `SqliteConnection` call sites this lesson's audit found before
      the refactor, and where they were concentrated.
- [ ] You can explain, from memory, the real drift this lesson's audit
      found between Lesson 23's stated MVVM rule and Lessons 43/47's
      actual code — and which convention you'd keep going forward, and
      why.
- [ ] You wrote your own retrospective entry (the last exercise above).
- [ ] Committed with a message stating why: for example,
      `git commit -m "Extract ItemRepository and record the v2 architecture retrospective"`.

---

Fifty lessons ago, this project started from a blank WPF window and the
idea that a garage inventory needed tracking. Every mechanic since —
data binding, SQLite, MVVM, virtualization, a real published `.exe` —
was proven for real before being trusted, not because the framework
documentation could be doubted, but because *this specific project's*
behavior, on *this specific machine*, is the only thing that actually
matters when something breaks. That discipline doesn't end at Lesson
50. It's the actual skill this course was teaching the whole time.
