# Lesson 52: A Proof That Doesn't Get Thrown Away

*(`xUnit`, `[Fact]`, `Assert`, testing `ItemRepository` for real)*

**User Story**
> As the developer maintaining Pocket Inventory, I want a real,
> permanent way to confirm `ItemRepository` still behaves correctly
> after a change, instead of re-proving it by hand every time.

**What you will build**
Every single lesson in this course has proven its own claims the same
way: a throwaway console project, real `dotnet run` output, then
`Delete the lab folder`. That discipline is real and valuable — but the
proof itself disappears the moment the folder is deleted. This lesson
builds a real, permanent xUnit test project, and gives `ItemRepository`
(Lesson 50) its first real, automated tests — proofs that stay in the
codebase and can be rerun, forever, with one command.

**What you need to know first:** Lesson 50: `ItemRepository`, real
before/after refactor verification. Lesson 23a: `catch` resolution by
type (not required, but the same "distinguish outcomes precisely"
instinct applies to test assertions).

**Terms introduced in this lesson:**
- **xUnit** — a real, widely-used .NET testing framework; `dotnet test`
  discovers and runs every test in a project automatically.
- **`[Fact]`** — marks a method as a real, runnable test — no arguments,
  always run exactly the same way.
- **`Assert`** — xUnit's own class of static methods
  (`Assert.Equal`, `Assert.Single`, `Assert.Empty`, and others) that
  each check one specific real condition and produce a real, structured
  failure message — naming exactly what was expected and what actually
  happened — when it doesn't hold.

**Objects and methods used**
- The `Repository` class (Lesson 50) reappears here, already given
  full treatment — brief reminder only, per the Repetition Rule.
  `[Fact]` and `Assert` are this lesson's own subject, given full
  treatment below.

---

## Concept Unit: A Real Test Project — Proof That Survives

### The Problem

This course's own verification method — write a throwaway lab, run it,
read the real output, delete the lab — has caught real, genuine bugs
(Lessons 23, 24, 28, 36, 44, and others). But once a lab is deleted,
its proof is gone; nothing stops a later change from silently breaking
what it proved, with no automatic way to notice.

### Introduce the Concept in Isolation
```bash
dotnet new xunit -o XunitLab
cd XunitLab
```

This template already generates one real file,
`UnitTest1.cs`, with one empty test. Replace it:

```csharp
namespace XunitLab;

public class UnitTest1
{
    [Fact]
    public void TwoPlusTwo_EqualsFour()
    {
        int result = 2 + 2;
        Assert.Equal(4, result);
    }
}
```

Run it:

```bash
dotnet test
```

Real output:

```text
A total of 1 test files matched the specified pattern.

Passed!  - Failed:     0, Passed:     1, Skipped:     0, Total:     1, Duration: 8 ms - lab-xunit.dll (net10.0)
```

Now add a second, deliberately wrong test:

```csharp
[Fact]
public void TwoPlusTwo_EqualsFive_DeliberatelyWrong()
{
    int result = 2 + 2;
    Assert.Equal(5, result);
}
```

Run it again:

```bash
dotnet test
```

Real, captured failure:

```text
[xUnit.net 00:00:00.48]     XunitLab.UnitTest1.TwoPlusTwo_EqualsFive_DeliberatelyWrong [FAIL]
  Failed XunitLab.UnitTest1.TwoPlusTwo_EqualsFive_DeliberatelyWrong [111 ms]
  Error Message:
   Assert.Equal() Failure: Values differ
Expected: 5
Actual:   4

Failed!  - Failed:     1, Passed:     1, Skipped:     0, Total:     2, Duration: 129 ms
```

#### Execution Trace

1. `dotnet test` — reappearing shape (`dotnet run`/`dotnet publish`,
   already familiar) — this time discovering and running every
   `[Fact]`-marked method in the project automatically, with no test
   named directly on the command line.
2. `TwoPlusTwo_EqualsFour`, the first real test — `Assert.Equal(4, result)`
   holds (`2 + 2` really is `4`) — counted as `1 Passed`.
3. `TwoPlusTwo_EqualsFive_DeliberatelyWrong`, the second — `result` is
   still `4`, but `Assert.Equal(5, result)` expects `5` — the assertion
   itself fails, and xUnit reports exactly what it expected (`5`) versus
   what it actually got (`4`), without needing a single
   `Console.WriteLine` written anywhere in the test.

*What this proves:* `dotnet test` runs every `[Fact]` in the project and
reports, for real, which passed and which failed — with a structured,
automatic failure message naming the exact expected and actual values,
something this course's own `Console.WriteLine`-based proofs have
always required a human to read and judge for themselves.

### Discard the Throwaway Example
Delete the `XunitLab` folder — but keep the deliberately-wrong test's
real failure output in mind; the next unit's own working test uses the
identical mechanism against something real.

### Mechanical Walkthrough

- `dotnet new xunit -o XunitLab` — **first appearance of the `xunit`
  template.** Generates a project already referencing the xUnit
  framework and its own test runner — nothing to configure by hand.
- `[Fact]` — **first appearance.** An attribute (the same bracketed
  syntax `[JsonIgnore]` used in Lesson 36) marking a method as a real,
  discoverable test — `dotnet test` finds every `[Fact]`-marked method
  in the project without being told their names individually.
- `Assert.Equal(4, result)` — **first appearance of `Assert`.** Takes
  the *expected* value first, the *actual* value second — reversing
  this order doesn't change whether the test passes, but does change
  which value the real failure message calls "Expected" versus
  "Actual."

### CS Lens

A `[Fact]` test and this course's own throwaway console labs are doing
the same underlying thing — running real code and checking whether the
result matches what's expected — but `[Fact]`'s check is itself real,
structured code (`Assert.Equal`), not a human eyeballing printed text.
This is the real, mechanical difference between "verified once, by a
person, in a transcript" and "verified every single time `dotnet test`
runs, by the computer itself."

### SE Lens

Why has this course used throwaway console labs at all, for 51 lessons,
instead of xUnit from the very first one? Because a throwaway lab
proves a *concept* — "does `virtual`/`override` actually work the way I
think" — a question with one right answer, asked once, where the
teaching value is in watching it happen. A test proves a *contract* —
"does `ItemRepository.Add` still work correctly" — a question worth
asking again and again, every time the surrounding code changes,
which is exactly the shape `[Fact]` and `dotnet test` are built for.
Different jobs, both real.

### Connection

`ItemRepository` (Lesson 50) is the first real, permanent object in
this project actually worth writing a permanent test against — built
next.

---

## Concept Unit: Testing `ItemRepository` for Real

### The Problem

`ItemRepository.Add`/`GetAll` have been proven correct exactly once,
by hand, in Lesson 50's own throwaway before/after labs — real, but
gone the moment those labs were deleted. Nothing currently protects
`ItemRepository` from a future change silently breaking it.

### Introduce the Concept in Isolation

```bash
dotnet new xunit -o RepositoryTestLab
cd RepositoryTestLab
dotnet add package Microsoft.Data.Sqlite
```

Replace `UnitTest1.cs` with a real copy of `ItemRepository`'s own shape
(Lesson 50), plus real tests against it:

```csharp
using Microsoft.Data.Sqlite;

namespace RepositoryTestLab;

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
}

public class ItemRepositoryTests
{
    private static ItemRepository CreateRepository()
    {
        string dbPath = Path.Combine(Path.GetTempPath(), $"lab-xunit-{Guid.NewGuid()}.db");
        ItemRepository repository = new ItemRepository($"Data Source={dbPath}");
        repository.EnsureDatabaseCreated();
        return repository;
    }

    [Fact]
    public void Add_ThenGetAll_ReturnsTheAddedItem()
    {
        ItemRepository repository = CreateRepository();

        repository.Add(new InventoryItem { Name = "Hammer", Category = "Tools" });

        List<InventoryItem> items = repository.GetAll();

        Assert.Single(items);
        Assert.Equal("Hammer", items[0].Name);
        Assert.Equal("Tools", items[0].Category);
    }

    [Fact]
    public void GetAll_OnEmptyDatabase_ReturnsEmptyList()
    {
        ItemRepository repository = CreateRepository();

        List<InventoryItem> items = repository.GetAll();

        Assert.Empty(items);
    }
}
```

Run it:

```bash
dotnet test
```

Real output:

```text
Passed!  - Failed:     0, Passed:     2, Skipped:     0, Total:     2, Duration: 200 ms - lab-xunit.dll (net10.0)
```

Now, to prove these tests would genuinely catch a real regression,
deliberately break `Add` — change
`command.Parameters.AddWithValue("@category", item.Category);` to
`command.Parameters.AddWithValue("@category", "BROKEN");` — and rerun:

```bash
dotnet test
```

Real, captured failure:

```text
[xUnit.net 00:00:00.18]     RepositoryTestLab.ItemRepositoryTests.Add_ThenGetAll_ReturnsTheAddedItem [FAIL]
  Failed RepositoryTestLab.ItemRepositoryTests.Add_ThenGetAll_ReturnsTheAddedItem [26 ms]
  Error Message:
   Assert.Equal() Failure: Strings differ
           ↓ (pos 0)
Expected: "Tools"
Actual:   "BROKEN"
           ↑ (pos 0)

Failed!  - Failed:     1, Passed:     1, Skipped:     0, Total:     2, Duration: 67 ms
```

#### Execution Trace

1. `CreateRepository()` builds a real, brand-new SQLite database file,
   named with a real `Guid` so every test gets its own — no test can
   see another test's data.
2. `Add_ThenGetAll_ReturnsTheAddedItem` — adds one real item, reads it
   back, and checks three real things: exactly one item came back
   (`Assert.Single`), its `Name` matches, and its `Category` matches.
3. With `Add` working correctly, both real assertions hold — `2 Passed`.
4. After deliberately breaking `Add` to always insert `"BROKEN"` instead
   of the item's real `Category`, rerunning finds
   `Add_ThenGetAll_ReturnsTheAddedItem` fails — a real, structured
   diff, `Expected: "Tools"` vs. `Actual: "BROKEN"` — while
   `GetAll_OnEmptyDatabase_ReturnsEmptyList` still passes, since it never
   touches `Category` at all.

*What this proves:* a real bug, introduced on purpose, was caught
automatically, with a precise, structured explanation of what broke —
`1 Failed` instead of a silent, unnoticed regression. This is the
concrete payoff of Lesson 50's own Repository extraction: a class with
no WPF dependencies, constructible and testable in a plain console
context, exactly as its own SE Lens claimed at the time.

### Discard the Throwaway Example
Restore `Add`'s real code (undo the deliberate break) before deleting
`RepositoryTestLab` — the real project's own test project, next, keeps
this pattern permanently instead of discarding it.

### Mechanical Walkthrough

- `Assert.Single(items)` — **first appearance.** Fails immediately if
  `items` doesn't contain *exactly* one element — more precise than
  `Assert.Equal(1, items.Count)`, and its own real failure message
  would say so directly if it didn't hold.
- `Assert.Empty(items)` — **first appearance.** The natural counterpart
  test to `Add_ThenGetAll` — confirms `GetAll` doesn't, say, always
  return a placeholder item even when the real table is empty.
- `Path.Combine(Path.GetTempPath(), $"lab-xunit-{Guid.NewGuid()}.db")`
  — reappearing shape (Lesson 47's own restore lab used
  `Path.GetTempPath()` the same way) — a fresh, uniquely-named database
  per test run, so tests never interfere with each other or leave
  files behind that a later run might accidentally reuse.

### CS Lens

This unit's own real, deliberate regression (`"BROKEN"` in place of
`item.Category`) is the concrete meaning of **regression testing**: a
test written once continues checking the *same* real behavior after
every future change, catching exactly the kind of silent,
one-line mistake that would otherwise ship unnoticed — the identical
category of real bug this course has caught by hand, via a human
reading transcript output, in Lessons 23, 24, 28, 36, and 44.

### SE Lens

Why does `ItemRepositoryTests` never reference `InventoryViewModel`,
`InventoryPage`, or anything WPF-related at all? Because
`ItemRepository` (Lesson 50) was deliberately extracted to depend on
nothing but `Microsoft.Data.Sqlite` — no `System.Windows` namespace
anywhere in it. That extraction is what makes `dotnet test` able to run
these tests in milliseconds, with no WPF window ever created — testing
`InventoryViewModel` directly would require either a real WPF
application context or extensive setup to fake one, exactly the
friction Lesson 50's own architecture review flagged as a real,
avoidable cost.

### Connection

The real project gains its own permanent `PocketInventory.Tests`
project next, with these exact tests kept for real, not discarded.

---

## Closing

### Connect the Pieces

`dotnet new xunit` (first unit) proved `[Fact]`/`Assert.Equal` catch a
real, deliberate mistake (`5` instead of `4`) with a structured,
automatic failure message — no human reading required. The second
unit's own real `ItemRepositoryTests` applied that exact mechanism to
`ItemRepository` (Lesson 50), and proved, by deliberately breaking
`Add` and rerunning, that a real regression is caught automatically —
the concrete payoff of extracting `ItemRepository` with zero WPF
dependencies in the first place.

### What Breaks Without This

Already demonstrated directly, on purpose, in this lesson's second
unit: deliberately breaking `Add` to insert `"BROKEN"` instead of the
real category produces a real, silent-looking change — nothing about
running the WPF app itself would obviously fail, since `"BROKEN"` is
still a valid string the UI would happily display. Without a real test
checking for the exact expected value, this exact class of bug ships
unnoticed. Restoring the real code and rerunning `dotnet test`
confirms the fix.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `PocketInventory.Tests/` (new test project),
  `ItemRepositoryTests.cs` (new).
- **Change type:** Add.
- **Dependencies:** `ItemRepository`, Lesson 50.

### Commands Needed

```bash
dotnet new xunit -o PocketInventory.Tests
cd PocketInventory.Tests
dotnet add package Microsoft.Data.Sqlite
dotnet add reference ../PocketInventory/PocketInventory.csproj
```

### Run It

On your Windows machine, create `PocketInventory.Tests` alongside your
real project (not inside it), referencing your real project so
`ItemRepositoryTests` can use your actual `ItemRepository` and
`InventoryItem` classes directly, rather than a second, duplicated
copy. Port this lesson's two real tests over, run `dotnet test`, and
confirm both pass against your own real database schema. Deliberately
break one real method (`Add`, `Delete`, or any other) and confirm
`dotnet test` catches it, exactly as this lesson's own lab did.

### Exercises

- Add a third real test, `Delete_RemovesTheItem`, following the same
  `CreateRepository()` pattern: add two items, delete one by `Id`,
  confirm `GetAll()` returns exactly the other one.
- Reread Lesson 45's real, hand-verified undo/redo proof (LIFO order, a
  deleted row getting a genuinely new `Id`) and convert its core claim
  into a real `[Fact]` test instead of a throwaway console harness.
- Predict, in your own words, why `CreateRepository()` generates a
  fresh, uniquely-named database file for every single test rather than
  one shared file reused across all of them — then break it on purpose
  (hardcode one shared path) and observe, with real output, what goes
  wrong when tests run in a different order or in parallel.

### Definition of Done

- [ ] You ran the first unit's pass/fail xUnit demo yourself, including
      the real, deliberate failure — not just read the transcript.
- [ ] You ran the second unit's `ItemRepositoryTests` for real,
      including the deliberate `Add` regression and its real, caught
      failure.
- [ ] A real `PocketInventory.Tests` project exists in your own
      project, referencing your real `ItemRepository`, with at least
      the two tests from this lesson passing against it.
- [ ] You can explain, in your own words and without re-reading this
      lesson, why `ItemRepository` specifically (and not
      `InventoryViewModel`) was the natural first thing to write real
      tests against.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add a real xUnit test project covering ItemRepository"`.
