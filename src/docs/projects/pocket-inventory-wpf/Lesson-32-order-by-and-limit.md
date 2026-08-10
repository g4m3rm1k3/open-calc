# Lesson 32: Text Sorts Like Text, Even When It Looks Like Numbers

*(`ORDER BY ... DESC LIMIT`, `WHERE ... IS NULL`)*

**User Story**
> As a user, I want to see my five most valuable items at a glance, and
> a list of items missing a purchase date.

**What you will build**
A real "Top 5 Most Valuable" list and an "Items Missing a Purchase Date"
warning list, both expressed as queries. This lesson also catches — and
fixes — a real, easy-to-miss bug this project's own schema invites:
`Value` is stored as `TEXT` (Lesson 13, for exactness), and asking
SQLite to `ORDER BY` a `TEXT` column sorts it as *text*, not as numbers
— proven directly, with real, visibly wrong output, before the actual
fix.

**What you need to know first:** Lesson 13: `Value` stored as `TEXT`.
Lesson 14: `PurchaseDate`, `DateTime?`, genuine absence. Lesson 31:
`GROUP BY`, reading multi-row query results.

**Terms introduced in this lesson:**
- **`ORDER BY`** — a SQL clause sorting a query's results; `ASC`
  (ascending, the default) or `DESC` (descending).
- **`LIMIT`** — caps how many rows a query returns, applied *after*
  `ORDER BY`, making "top N" a property of the query itself.
- **`CAST(... AS ...)`** — converts a value from one SQL storage type to
  another for the purposes of a single expression, without changing
  what's actually stored.
- **Lexicographic (text) ordering** — comparing values character by
  character, the way SQL compares `TEXT` by default; genuinely different
  from numeric ordering the moment the values involved have a different
  number of digits.

**Objects and methods used**
- `GROUP BY`/`SUM()` (Lessons 30, 31) reappear here, already given
  full treatment — brief reminder only, per the Repetition Rule.
  `ORDER BY ... DESC LIMIT` is this lesson's own subject, given full
  treatment below.

---

## Concept Unit: `ORDER BY` — Proving It Sorts Text as Text

### The Problem

A "Top 5 Most Valuable" list needs items sorted by `Value`, highest
first. `Value` has been a `TEXT` column since Lesson 13 — worth checking
directly whether `ORDER BY` on it actually produces correct numeric
order, rather than assuming it does because the column happens to hold
numbers.

### Introduce the Concept in Isolation
```bash
dotnet new console -o lab-orderby
cd lab-orderby
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
    command.CommandText = "CREATE TABLE IF NOT EXISTS Items (Id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL, Value TEXT NOT NULL)";
    command.ExecuteNonQuery();
}

(string Name, decimal Value)[] items =
{
    ("Widget A", 9.99m),
    ("Widget B", 10.00m),
    ("Widget C", 100.00m),
    ("Widget D", 2.50m),
};

foreach (var item in items)
{
    using SqliteCommand insert = connection.CreateCommand();
    insert.CommandText = "INSERT INTO Items (Name, Value) VALUES (@name, @value)";
    insert.Parameters.AddWithValue("@name", item.Name);
    insert.Parameters.AddWithValue("@value", item.Value.ToString(CultureInfo.InvariantCulture));
    insert.ExecuteNonQuery();
}

Console.WriteLine("ORDER BY Value DESC, straight on the TEXT column:");
using (SqliteCommand orderQuery = connection.CreateCommand())
{
    orderQuery.CommandText = "SELECT Name, Value FROM Items ORDER BY Value DESC";
    using SqliteDataReader reader = orderQuery.ExecuteReader();
    while (reader.Read())
    {
        Console.WriteLine($"  {reader.GetString(0)}: {reader.GetString(1)}");
    }
}

Console.WriteLine("ORDER BY CAST(Value AS REAL) DESC, cast to a real number first:");
using (SqliteCommand fixedQuery = connection.CreateCommand())
{
    fixedQuery.CommandText = "SELECT Name, Value FROM Items ORDER BY CAST(Value AS REAL) DESC LIMIT 3";
    using SqliteDataReader reader = fixedQuery.ExecuteReader();
    while (reader.Read())
    {
        Console.WriteLine($"  {reader.GetString(0)}: {reader.GetString(1)}");
    }
}
```

Run it:

```bash
dotnet run
```

Real output:

```text
ORDER BY Value DESC, straight on the TEXT column:
  Widget A: 9.99
  Widget D: 2.50
  Widget C: 100.00
  Widget B: 10.00
ORDER BY CAST(Value AS REAL) DESC, cast to a real number first:
  Widget C: 100.00
  Widget B: 10.00
  Widget A: 9.99
```

#### Execution Trace

1. `"9.99"` prints first from the raw-`TEXT`-sorted `foreach` — the
   highest-sorting string lexicographically, since `'9'` is the largest
   leading digit among all four values.
2. `"2.50"` prints next — `'2'` is the next-largest leading digit.
3. `"100.00"` prints third — its leading `'1'` loses to `'2'` and `'9'`,
   but beats `"10.00"` because, character by character, `"100.00"`'s
   third character (`'0'`) sorts after `"10.00"`'s third character
   (`'.'`).
4. `"10.00"` prints last — real, correct proof the raw-text order is
   `9.99, 2.50, 100.00, 10.00`, nothing like true numeric order.
5. `"100.00"` prints first from the second, `CAST`-fixed `foreach` — the
   real largest number — followed by `"10.00"`, then `"9.99"`, genuinely
   descending, `LIMIT 3` correctly stopping there and excluding
   `"2.50"` entirely.

*What this proves:* `ORDER BY Value DESC` on the raw `TEXT` column
produces a genuinely wrong "most valuable" order — `"9.99"` sorts ahead
of `"100.00"` because SQLite compares them character by character, and
`'9'` simply comes after `'1'` alphabetically; `"100.00"` sorts ahead of
`"10.00"` for the same reason, comparing digit by digit until the fifth
character (`'0'` vs `'.'`) decides it, with no idea either string
represents a number at all. `CAST(Value AS REAL)` converts each value to
a real number *for the duration of this one query* — `Value` itself, in
the table, is completely unchanged — and sorting on that produces the
correct order: `100.00`, then `10.00`, then `9.99`, with `LIMIT 3`
correctly stopping there.

### Discard the Throwaway Example
Delete the `lab-orderby` folder. `ORDER BY CAST(... AS REAL)` is not
discarded — the real "Top 5 Most Valuable" query uses exactly this next.

### Mechanical Walkthrough

- `ORDER BY Value DESC` — **first appearance of `ORDER BY`,
  deliberately shown broken first.** Sorts `TEXT` values
  lexicographically by default — correct for actual text (`Name`, for
  instance), silently wrong for numbers stored as text.
- `CAST(Value AS REAL)` — **first appearance of `CAST`.** Converts each
  row's `Value` into SQLite's `REAL` (floating-point) type just for this
  expression — the same floating-point representation Lesson 30 already
  proved `SUM()` uses internally, here used deliberately, for ordering
  only, where the tiny precision error is completely irrelevant (it
  could never change which of two genuinely different prices sorts
  first).
- `LIMIT 3` — **first appearance.** Applied after `ORDER BY` has already
  put every row in the correct order — caps the result to the first
  three rows of that order, exactly "top 3," computed by the database,
  not by C# slicing a longer list after the fact.

### CS Lens

This is a real, concrete instance of a general truth about typed data:
a column's *storage type* (`TEXT`, chosen in Lesson 13 for exactness)
and the *comparison rules* that type implies (lexicographic for `TEXT`)
are two separate facts, and assuming the second because you know the
first is a genuine, common mistake — the exact reason this unit proved
the wrong behavior first, with real output, instead of asserting the fix
was necessary without evidence.

### SE Lens

Why not just store `Value` as SQLite's native `REAL` type from the
start, avoiding this problem (and `CAST`) entirely? Because `REAL` is
floating-point, and Lesson 13 already proved, directly, why that's the
wrong choice for money — the exact representation error this lesson's
own `SUM()` discussion (Lesson 30) already accepted as a tolerable,
rounded-away cost for *aggregates*, but which would be a much worse
choice for the *stored, authoritative* value of every item's price.
`TEXT` storage plus a deliberate, one-query-at-a-time `CAST` for sorting
is the honest middle ground: exact storage, imprecise-but-irrelevant
comparison, used only where imprecision genuinely can't matter.

### Connection

The real "Top 5 Most Valuable" list uses exactly this `CAST`/`ORDER BY`/
`LIMIT` combination next.

---

## Concept Unit: Top 5 Most Valuable, and Items Missing a Purchase Date

### The Problem

Nothing currently surfaces a quick "what are my most valuable items"
view, or flags items with no recorded purchase date — both genuinely
useful at-a-glance summaries this lesson's user story asks for.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryPage.xaml`, `InventoryViewModel.cs`.
- **Change type:** Add.
- **Dependencies:** `ORDER BY`/`CAST`/`LIMIT`, previous unit;
  `PurchaseDate`, Lesson 14.

### The New Code — Top 5 Most Valuable

```csharp
public ObservableCollection<InventoryItem> TopValuableItems
{
    get
    {
        ObservableCollection<InventoryItem> results = new ObservableCollection<InventoryItem>();

        using SqliteConnection connection = new SqliteConnection(ConnectionString);
        connection.Open();
        using SqliteCommand command = connection.CreateCommand();
        command.CommandText = "SELECT Name, Value FROM Items WHERE IsArchived = 0 ORDER BY CAST(Value AS REAL) DESC LIMIT 5";

        using SqliteDataReader reader = command.ExecuteReader();
        while (reader.Read())
        {
            results.Add(new InventoryItem
            {
                Name = reader.GetString(0),
                Value = decimal.Parse(reader.GetString(1), CultureInfo.InvariantCulture)
            });
        }

        return results;
    }
}
```

### The New Code — Missing a Purchase Date

```csharp
public ObservableCollection<InventoryItem> ItemsMissingPurchaseDate
{
    get
    {
        ObservableCollection<InventoryItem> results = new ObservableCollection<InventoryItem>();

        using SqliteConnection connection = new SqliteConnection(ConnectionString);
        connection.Open();
        using SqliteCommand command = connection.CreateCommand();
        command.CommandText = "SELECT Name FROM Items WHERE IsArchived = 0 AND PurchaseDate IS NULL";

        using SqliteDataReader reader = command.ExecuteReader();
        while (reader.Read())
        {
            results.Add(new InventoryItem { Name = reader.GetString(0) });
        }

        return results;
    }
}
```

### Mechanical Walkthrough

- `ORDER BY CAST(Value AS REAL) DESC LIMIT 5` — reappearing exactly
  (this lesson's first unit), applied for real — five rows, correctly
  ordered by real numeric value, computed entirely inside the query.
- `WHERE PurchaseDate IS NULL` — (first appearance of `IS NULL` in this
  project's own queries) — matches rows where that column is genuinely
  absent; the same `DBNull`/nullable-column concept Lesson 14 already
  established, now expressed as a `WHERE` condition instead of a
  C#-side check. Worth naming why `Category` couldn't fill this same
  role, the way the general idea of "missing X" might first suggest:
  `Category` has been `NOT NULL` since Lesson 12 — every item always has
  a real category — so "items missing a category" isn't a state this
  project's schema can even represent; `PurchaseDate`, genuinely
  nullable since Lesson 14, is the real field this pattern applies to
  here.
- Both getters build lightweight `InventoryItem`s with only the fields
  each view actually needs (`Name`/`Value`, or just `Name`) — reappearing
  the `CategoryTotal`-style reasoning from Lesson 31: these results exist
  purely for display, never saved back.

### CS Lens

`LIMIT`, applied after `ORDER BY`, is "top N" expressed declaratively —
the database computes the full correct order and then simply stops
early, rather than this project loading every item, sorting all of them
in C#, and discarding everything past the fifth. For a small inventory
the difference is invisible; for a genuinely large one, `LIMIT` means
the database can often avoid fully sorting rows it will never return at
all — real, structural efficiency `ORDER BY`/`LIMIT` together provide
that "load everything, then slice in C#" never can.

### SE Lens

Why does `ItemsMissingPurchaseDate` skip `ORDER BY`/`LIMIT` entirely,
unlike `TopValuableItems`? Because "missing a purchase date" isn't a
ranking — every matching item is equally relevant, there's no natural
"top 5" among them, and adding an arbitrary limit would silently hide
real items a user actually needs to see and fix. Using `LIMIT`
everywhere, out of habit, rather than only where a genuine "top N"
question is actually being asked, would be applying this lesson's tool
past the problem it actually solves.

### Commands Needed

```bash
dotnet run
```

### Run It

On your Windows machine: the Top 5 panel shows exactly the five most
valuable non-archived items, correctly ordered — add an item worth more
than the current lowest of the five; it displaces the previous fifth
item immediately. The Missing Purchase Date panel lists every item with
no recorded date; add a purchase date to one through the Edit flow
(Lesson 21); it disappears from the list.

### Connection

Real, correctly ordered, correctly limited summaries now exist
alongside the totals from Lessons 30 and 31. The next lesson composes
all three into one small dashboard, reusing each exactly as built here.

---

## Closing

### Connect the Pieces

`TopValuableItems` runs `ORDER BY CAST(Value AS REAL) DESC LIMIT 5` —
the exact fix this lesson's own lab proved necessary, after first
proving, with real and visibly wrong output, that sorting the raw `TEXT`
column directly gets the order wrong. `ItemsMissingPurchaseDate` runs
`WHERE PurchaseDate IS NULL`, the direct SQL expression of the same
"genuinely absent" state `DateTime?` and `DBNull` have represented in
this project since Lesson 14 — substituted here for the roadmap's
original "missing category" idea specifically because this project's
own `Category` has been `NOT NULL` since Lesson 12, a real,
project-specific adaptation rather than a generic template applied
without checking it actually fits.

### What Breaks Without This

Temporarily change `TopValuableItems`'s query back to plain
`ORDER BY Value DESC LIMIT 5` (dropping the `CAST`). Add a handful of
items with values like `9.99`, `49.99`, `199.99`, and `1099.00`. Real,
representative failure: the panel confidently displays a "Top 5" list
that isn't actually sorted by value at all — a genuinely cheap item
could easily outrank a genuinely expensive one, exactly the lexicographic
mis-ordering this lesson's own lab proved happens, now silently
misleading a real user with no error, no warning, just a wrong answer
presented with total confidence. Restore the real `CAST(Value AS REAL)`
afterward.

### Exercises

- In the `lab-orderby` throwaway pattern, add a fifth item whose value
  would sort differently under lexicographic versus numeric ordering
  (for example, `1000.00`) and confirm, with real output, both the wrong
  and the correct order include it in a different relative position.
- Predict, in your own words, whether `ORDER BY CAST(Value AS REAL) ASC LIMIT 5`
  (ascending, not descending) would be the right query for a "5 Least
  Valuable Items" feature — then confirm by trying it in a throwaway
  lab.
- `PurchaseDate` isn't the only nullable-feeling field this project has
  — `Notes` and `SerialNumber` are both plain, non-nullable `string`s
  defaulting to `""`. Predict, in your own words, what
  `WHERE Notes IS NULL` would return against this project's real
  database, given `Notes` is `NOT NULL` — then explain what query would
  actually find "items with no notes," if that were a real feature this
  project needed.

### Definition of Done

- [ ] `TopValuableItems` returns the correct top 5 items by value, using
      `CAST(Value AS REAL)` for genuinely correct numeric ordering.
- [ ] `ItemsMissingPurchaseDate` returns every non-archived item with a
      genuinely absent purchase date, using `WHERE ... IS NULL`.
- [ ] Both panels update correctly as items are added, edited, or
      archived.
- [ ] You reproduced the lexicographic-ordering bug on purpose (dropping
      `CAST`), confirmed the "Top 5" list is silently wrong, and restored
      the real query.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add Top 5 Most Valuable and Missing Purchase Date views via ORDER BY/LIMIT/IS NULL"`.
