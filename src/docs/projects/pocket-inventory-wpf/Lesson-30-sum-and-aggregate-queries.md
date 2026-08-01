# Lesson 30: Let the Database Add It Up

*(`SUM()`, scalar queries)*

**User Story**
> As a user, I want to know the total value of my inventory, without
> scrolling through every row and adding it up myself.

**What you will build**
A running total, shown above the grid, computed by SQLite itself — not
by looping over `Items` in C# and adding `Value` by hand. This lesson
also proves something genuinely important, easy to get wrong silently:
`Value` is stored as `TEXT` specifically for exactness (Lesson 13's
whole point), but SQL's `SUM()` does *not* preserve that exactness the
way `decimal` arithmetic in C# does — worth proving directly, not
assuming, before trusting a single total this project displays to a
user.

**What you need to know first:** Lesson 9/10: `SqliteCommand`,
`ExecuteReader`. Lesson 13: why `Value` is `decimal`, stored as exact
`TEXT`, and the real floating-point representation error `double`
has.

**Terms introduced in this lesson:**
- **Aggregate function** — a SQL function (`SUM()`, `COUNT()`, `AVG()`,
  and others, Lesson 31 covers more) that computes one result from many
  rows, instead of returning one result per row the way `SELECT` alone
  does.
- **Scalar query** — a query whose entire result is a single value, read
  with `ExecuteScalar()` instead of `ExecuteReader()`.

---

## Concept Unit: `SUM()` — and Its Real, Honest Limit

### The Problem

Computing a total by reading every item into C# and adding `Value` in a
loop works, but makes SQLite — a real database, built specifically for
this — do nothing, while this project reimplements arithmetic it
already provides. Before trusting `SUM()` for this project specifically,
though, its actual behavior against a `TEXT`-stored `decimal` column
needs to be proven, not assumed.

### Introduce the Concept in Isolation
```bash
dotnet new console -o lab-sum
cd lab-sum
dotnet add package Microsoft.Data.Sqlite
```

Replace `Program.cs`:

```csharp
using Microsoft.Data.Sqlite;
using System.Globalization;

using SqliteConnection connection = new SqliteConnection("Data Source=lab.db");
connection.Open();

using (SqliteCommand command = connection.CreateCommand())
{
    command.CommandText = "CREATE TABLE IF NOT EXISTS Items (Id INTEGER PRIMARY KEY AUTOINCREMENT, Value TEXT NOT NULL)";
    command.ExecuteNonQuery();
}

using (SqliteCommand sumQuery = connection.CreateCommand())
{
    sumQuery.CommandText = "SELECT SUM(Value) FROM Items";
    object? emptyResult = sumQuery.ExecuteScalar();
    Console.WriteLine($"SUM on an empty table: is DBNull? {emptyResult is DBNull}");
}

decimal[] values = { 0.1m, 0.2m };
foreach (decimal v in values)
{
    using SqliteCommand insert = connection.CreateCommand();
    insert.CommandText = "INSERT INTO Items (Value) VALUES (@value)";
    insert.Parameters.AddWithValue("@value", v.ToString(CultureInfo.InvariantCulture));
    insert.ExecuteNonQuery();
}

using (SqliteCommand sumQuery = connection.CreateCommand())
{
    sumQuery.CommandText = "SELECT SUM(Value) FROM Items";
    object result = sumQuery.ExecuteScalar()!;
    Console.WriteLine($"SUM('0.1' + '0.2') via SQL: {result} (type: {result.GetType().Name})");
}

decimal csharpSum = values.Sum();
Console.WriteLine($"The same sum, in C#, as real decimal: {csharpSum}");
```

Run it:

```bash
dotnet run
```

Real output:

```text
SUM on an empty table: is DBNull? True
SUM('0.1' + '0.2') via SQL: 0.30000000000000004 (type: Double)
The same sum, in C#, as real decimal: 0.3
```

#### Execution Trace

1. `SUM(Value)` runs against a freshly created, still-empty table —
   SQLite's aggregate functions always return exactly one row even over
   zero input rows; here that one row's one value is SQL `NULL`,
   confirmed by `emptyResult is DBNull` printing `True`.
2. The `foreach` inserts `0.1m` then `0.2m`, each converted to its exact
   `InvariantCulture` text (`"0.1"`, `"0.2"`) before being stored.
3. `SUM(Value)` runs again, now against two real rows — SQLite parses
   both `TEXT` values as numbers and adds them using its own internal
   floating-point arithmetic, producing `0.30000000000000004`, printed
   with its real runtime type, `Double`.
4. `values.Sum()`, computed separately in C# using real `decimal`
   arithmetic on the same two numbers, produces the exact `0.3` —
   proving the discrepancy comes specifically from `SUM()`'s own
   internal computation, not from anything about how the values were
   stored or retrieved.

*What this proves:* `SUM()` on a table with no rows returns SQL `NULL`
— `ExecuteScalar()` hands that back as a real `DBNull`, not `0`, a real
edge case worth checking explicitly (a brand-new inventory has zero
items, and a total that crashes or shows garbage on day one would be a
bad first impression). More importantly: `SUM('0.1' + '0.2')`, computed
entirely inside SQLite, returns `0.30000000000000004` — the *exact* same
floating-point representation error Lesson 13 proved `double` has,
because SQLite's own `SUM()` performs its arithmetic using floating-point
internally, regardless of the fact that `Value` was stored as exact
`TEXT` specifically to avoid this. C#'s own `decimal` sum, computed
separately for comparison, gets the exact `0.3`.

### Discard the Throwaway Example
Delete the `lab-sum` folder. `SUM()`/`ExecuteScalar()` are not discarded
— the real project's total uses exactly this, with this exact limitation
understood and handled next.

### Mechanical Walkthrough

- `SELECT SUM(Value) FROM Items` — **first appearance of an aggregate
  function.** Computes one number from every row's `Value`, instead of
  one row per item the way every previous `SELECT` in this project has.
- `ExecuteScalar()` — **first appearance.** Returns exactly one value
  (the query's single result), simpler than `ExecuteReader()` for a
  query that was never going to return multiple rows or columns anyway.
- `result is DBNull` — reappearing (`DBNull`, Lesson 14's nullable-column
  handling), here checked on a scalar result instead of a specific
  reader column.
- The real `0.30000000000000004` — worth stating plainly: this is not a
  bug in this project's code, it's SQLite's own `SUM()` implementation,
  verified directly rather than assumed correct because `Value` happens
  to be stored as exact text.

### CS Lens

This is the exact same **floating-point representation error** Lesson
13 named and proved for `double` — reappearing here in a place this
project's own schema design (`Value TEXT NOT NULL`, chosen specifically
for exactness) might reasonably have suggested was already solved. It
wasn't, for this one specific operation: storage exactness and
*computation* exactness are two different guarantees, and SQL's `SUM()`
only ever gives the second one over `REAL` (floating-point) arithmetic,
regardless of what a column's declared type says.

### SE Lens

Given this real imprecision, is `SUM()` still the right tool for this
project's running total? Yes — with a caveat, stated honestly, not
hidden: the error here is on the order of `10^-17`, roughly 15 orders of
magnitude smaller than a single cent. Formatting the result as currency
(`ToString("C")`, Lesson 13) rounds to two decimal places, which
completely absorbs an error this small for any inventory total a real
user would ever accumulate — the displayed total will always be
correct, in practice. If this project ever needed a *bit-exact* total
for something like accounting reconciliation, the honest fix would be
reading every `Value` back with `SELECT` and summing them in C# with
real `decimal` arithmetic instead — trading "let the database do it" for
genuine exactness, a real, considered tradeoff, not a default assumed
without checking.

### Connection

The real running total, computed with `SUM()` and displayed safely
rounded, is wired above `ItemsGrid` next.

---

## Concept Unit: A Real Running Total Above `ItemsGrid`

### The Problem

Nothing currently shows the total value of everything in this project's
inventory — a genuinely useful fact this lesson's user story asks for
directly.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryPage.xaml`, `InventoryViewModel.cs`.
- **Change type:** Add.
- **Dependencies:** `SUM()`/`ExecuteScalar`, previous unit.

### The New Code — the Display

```xml
<TextBlock Text="{Binding TotalValue, StringFormat={}Total Value: {0:C}}"
           FontWeight="Bold"
           Margin="0,8,0,0" />
```

### The New Code — Computing the Total

```csharp
public decimal TotalValue
{
    get
    {
        using SqliteConnection connection = new SqliteConnection(ConnectionString);
        connection.Open();
        using SqliteCommand command = connection.CreateCommand();
        command.CommandText = "SELECT SUM(Value) FROM Items WHERE IsArchived = 0";
        object result = command.ExecuteScalar() ?? 0m;
        return result is DBNull ? 0m : Convert.ToDecimal(result);
    }
}
```

`AddOrUpdateItem`, `RemoveItem`, `ArchiveItem`, and `RestoreItem` each
now also call `PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(TotalValue)));`
right after they finish, so the displayed total stays live.

### Mechanical Walkthrough

- `SELECT SUM(Value) FROM Items WHERE IsArchived = 0` — reappearing
  (`WHERE`, familiar since Lesson 21's `UPDATE`), the total deliberately
  excludes archived items (Lesson 28) — an archived item isn't part of
  a user's *current* inventory, the same reasoning that already hides it
  from `ItemsGrid` itself.
- `object result = command.ExecuteScalar() ?? 0m;` / `result is DBNull ? 0m : Convert.ToDecimal(result)`
  — handles both the empty-table case (a genuinely `null` C# result from
  `ExecuteScalar()` itself, which the `?? 0m` never actually reaches in
  practice here since `ExecuteScalar` returns `DBNull.Value`, not `null`,
  for a `NULL` SQL result — the explicit `DBNull` check is what actually
  matters) and the all-archived case (`SUM()` over zero matching rows,
  the identical `DBNull` result this lesson's first unit already proved)
  — both correctly become `0m`, not a crash.
- `Convert.ToDecimal(result)` — reappearing (`Convert.ToDecimal`, this
  lesson's first unit), converting `SUM()`'s real `double` result into
  this project's own `decimal` type, the same type `Value` itself uses —
  consistent on the C# side even though the underlying SQL computation
  happened in floating point first.
- `StringFormat={}Total Value: {0:C}` — reappearing (`StringFormat`,
  Lesson 13), `ToString("C")`'s own display formatting, the specific
  choice this lesson's first unit's SE Lens already justified: rounding
  to currency absorbs the real, tiny floating-point error `SUM()`
  introduces.

### CS Lens

`TotalValue` computed as a property, re-querying the database every time
it's read, rather than maintained as a running C# total updated
incrementally on every add/edit/delete, is the direct payoff of this
lesson's whole premise: the database is asked the question fresh, every
time, using the one aggregate operation it's actually built for, instead
of this project trying to keep its own separate, hand-maintained running
total correctly in sync with every possible way `Items` can change.

### SE Lens

Why query the database directly inside `TotalValue`'s getter instead of
just summing `Items` (already loaded in memory) in C#, using real
`decimal` arithmetic, avoiding the floating-point wrinkle entirely?
Because summing `Items` in memory would only reflect items already
loaded on this run — genuinely fine today, since this project loads
everything on startup, but a real, deliberate choice worth naming: this
implementation demonstrates `SUM()` specifically, per this lesson's own
subject, at the honest cost of the tiny, safely-rounded imprecision this
lesson already proved and justified. A future version handling far more
data than fits comfortably in memory would need the database query
regardless — this lesson's approach is also the one that scales.

### Commands Needed

```bash
dotnet run
```

### Run It

On your Windows machine: the running total appears above the grid,
correctly reflecting every non-archived item's value. Add an item; the
total updates immediately. Archive an item; the total decreases by
exactly that item's value. Delete every item (or start from an empty
database): the total shows `$0.00`, not an error.

### Connection

Totals are real, live, and honestly understood, imprecision and all.
The next lesson breaks that same total down by category — one query,
not one query per category — using `GROUP BY`.

---

## Closing

### Connect the Pieces

Every time `AddOrUpdateItem`, `RemoveItem`, `ArchiveItem`, or
`RestoreItem` finishes, it raises `PropertyChanged` for `TotalValue`,
which — because `{Binding TotalValue, ...}` is a live binding, the same
mechanism every property in this project has used since Lesson 7 — causes
WPF to re-read the property, running a fresh `SELECT SUM(Value) FROM Items WHERE IsArchived = 0`
against the real, current database state. The `DBNull`/`Convert.ToDecimal`
handling proven in this lesson's own labs makes the empty and all-archived
cases both resolve safely to `$0.00`, and `StringFormat={}Total Value: {0:C}`
rounds away the tiny, real, proven-and-justified floating-point error
`SUM()` itself introduces.

### What Breaks Without This

Temporarily remove the `result is DBNull ? 0m : ...` check, replacing it
with a direct `Convert.ToDecimal(result)` call. Delete every item from a
running copy of the app (or start from a brand-new database). Real,
representative failure: `TotalValue`'s getter throws — `Convert.ToDecimal(DBNull.Value)`
raises an `InvalidCastException`, because `DBNull` has no meaningful
numeric conversion. A brand-new user, with zero items, would see this
project crash the instant it tried to display a total — the exact
scenario this lesson's own first unit deliberately tested before writing
any real code. Restore the real `DBNull` check afterward.

### Exercises

- In the `lab-sum` throwaway pattern, insert values that sum to a round
  number by hand (for example, `10.00`, `20.00`, `70.00`) and confirm,
  with real output, whether `SUM()` returns the exact round total or a
  tiny floating-point artifact this time — not every sum shows visible
  error, only some, depending on which specific fractions are involved.
- Predict, in your own words, what `SELECT COUNT(*) FROM Items` would
  return on an empty table — `DBNull`, like `SUM()`, or something else —
  then confirm in a throwaway lab. (Lesson 31 uses `COUNT()` for real.)
- Write a version of `TotalValue` that reads every `Value` back with a
  plain `SELECT` and sums them in C# using real `decimal` arithmetic
  instead of SQL `SUM()` — confirm it produces the bit-exact `0.3` for
  the `0.1`/`0.2` case this lesson's lab already proved `SUM()` doesn't.

### Definition of Done

- [ ] `TotalValue` (`decimal`) is computed via a real SQL `SUM()` query,
      excluding archived items.
- [ ] The running total displays above `ItemsGrid`, formatted as
      currency.
- [ ] The total updates live after every add, edit, delete, archive, and
      restore.
- [ ] An empty inventory shows `$0.00`, not an error.
- [ ] You reproduced the `DBNull` crash on purpose (removing the check),
      confirmed it, and restored the real handling.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add a live total inventory value via SQL SUM(), with proven-safe rounding — Epic 8 begins"`.
