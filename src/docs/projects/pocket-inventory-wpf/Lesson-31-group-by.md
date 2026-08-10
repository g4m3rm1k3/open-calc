# Lesson 31: One Query, Many Totals

*(`GROUP BY`)*

**User Story**
> As a user, I want to see my inventory's total value broken down by
> category — Tools, Electronics, and the rest, each with its own total.

**What you will build**
A small breakdown panel: one row per category, each showing that
category's own item count and total value. The transferable problem
underneath this lesson: computing this by looping over every `Category`
value and running a separate `SUM()` query per category would work, but
means one query per category — five categories, five round trips to the
database, for information one well-formed query can return at once.

**What you need to know first:** Lesson 30: `SUM()`, `ExecuteScalar`,
the real floating-point caveat already proven and handled there. Lesson
12: `enum Category`.

**Terms introduced in this lesson:**
- **`GROUP BY`** — a SQL clause that partitions a table's rows into
  groups sharing the same value in a named column, then applies any
  aggregate function (`SUM()`, `COUNT()`, and others) *per group*
  instead of across the whole table.

**Objects and methods used**
- `SUM()`/`ExecuteReader()` (Lesson 30) reappear here, already given
  full treatment — brief reminder only, per the Repetition Rule.
  `GROUP BY` is this lesson's own subject, given full treatment below.

---

## Concept Unit: `GROUP BY` — One Row Per Category

### The Problem

`TotalValue` (Lesson 30) computes one number across every item. Breaking
that down *by category* — Tools' own total, Electronics' own total, and
so on — one `SUM()` per category, run separately, would mean as many
queries as there are categories in use.

### Introduce the Concept in Isolation
```bash
dotnet new console -o lab-groupby
cd lab-groupby
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
    command.CommandText = "CREATE TABLE IF NOT EXISTS Items (Id INTEGER PRIMARY KEY AUTOINCREMENT, Category TEXT NOT NULL, Value TEXT NOT NULL)";
    command.ExecuteNonQuery();
}

(string Category, decimal Value)[] items =
{
    ("Tools", 49.99m),
    ("Tools", 15.00m),
    ("Electronics", 299.99m),
    ("Consumables", 5.50m),
};

foreach (var item in items)
{
    using SqliteCommand insert = connection.CreateCommand();
    insert.CommandText = "INSERT INTO Items (Category, Value) VALUES (@category, @value)";
    insert.Parameters.AddWithValue("@category", item.Category);
    insert.Parameters.AddWithValue("@value", item.Value.ToString(CultureInfo.InvariantCulture));
    insert.ExecuteNonQuery();
}

using (SqliteCommand groupQuery = connection.CreateCommand())
{
    groupQuery.CommandText = "SELECT Category, SUM(Value), COUNT(*) FROM Items GROUP BY Category";
    using SqliteDataReader reader = groupQuery.ExecuteReader();
    while (reader.Read())
    {
        string category = reader.GetString(0);
        decimal total = Convert.ToDecimal(reader.GetValue(1));
        long count = reader.GetInt64(2);
        Console.WriteLine($"{category}: {count} item(s), total {total.ToString("C")}");
    }
}
```

Run it:

```bash
dotnet run
```

Real output:

```text
Consumables: 1 item(s), total $5.50
Electronics: 1 item(s), total $299.99
Tools: 2 item(s), total $64.99
```

#### Execution Trace

1. Four rows are inserted: two `"Tools"`, one `"Electronics"`, one
   `"Consumables"`.
2. `GROUP BY Category` partitions those four rows into three groups —
   `"Tools"` (2 rows), `"Electronics"` (1 row), `"Consumables"` (1 row)
   — before `SUM`/`COUNT` ever run.
3. The `foreach` (via `reader.Read()`) visits the first group's result
   row, `"Consumables"`, printing its own count (`1`) and total
   (`$5.50`) — computed only from that group's one row.
4. The loop advances to `"Electronics"`, printing `1` and `$299.99` —
   entirely independent of the row just printed.
5. The loop reaches `"Tools"` last, printing `2` and `$64.99` — the sum
   of exactly its own two rows (`49.99 + 15.00`), then stops; three
   groups, three rows read, nothing left.

*What this proves:* one query, `GROUP BY Category`, produced exactly
three rows — one per distinct category actually present in the data,
never one per category `enum Category` merely *defines* (this lab used
plain strings, but the real project's five `Category` members would
behave identically: a category with zero items simply produces no row
at all). `SUM(Value)` and `COUNT(*)` were each computed *per group*, not
across the whole table — `"Tools"`'s row correctly shows `2` items and
`$64.99` (`49.99 + 15.00`), while `"Electronics"`'s row shows `1` and
its own single item's value, entirely independent computations sharing
one query.

### Discard the Throwaway Example
Delete the `lab-groupby` folder. `GROUP BY` is not discarded — the real
breakdown panel uses exactly this next.

### Mechanical Walkthrough

- `SELECT Category, SUM(Value), COUNT(*) FROM Items GROUP BY Category`
  — **first appearance of `GROUP BY`.** Every column in the `SELECT`
  list that isn't inside an aggregate function — here, just `Category`
  — must be the column (or one of the columns) named in `GROUP BY`; it's
  what makes "one row per group" a coherent idea at all, since every row
  in a group shares that value by definition.
- `COUNT(*)` — (first appearance) — an aggregate function counting rows,
  regardless of any column's actual value; `*` here means "count the
  rows themselves," not any specific column.
- Three result rows from one `ExecuteReader()` call, each read the same
  way `SELECT`'s own multi-row results always have been (Lesson 10) —
  `GROUP BY` doesn't change how results are read, only how many rows
  come back and what each one represents.

### CS Lens

`GROUP BY` is the SQL-level version of the exact partitioning idea
`GroupDescriptions` (Lesson 17) already gave `ICollectionView` — the
same underlying concept, expressed at two different layers of this
project. The WPF version partitions *already-loaded* `InventoryItem`
objects for presentation; `GROUP BY` partitions rows *inside the
database itself*, before anything is loaded into C# at all — genuinely
useful specifically when the *aggregate per group* (a total, a count) is
what's actually needed, not the individual grouped rows themselves.

### SE Lens

Why is running one query with `GROUP BY` meaningfully better than
looping over every `Category` value in C# and running a separate
`SUM()` per category (five categories, five queries)? Because every
query is a real round trip — to the database engine, and in a
networked-database future this project doesn't use yet but easily could,
across a real network. Five round trips for information one query
already returns is real, measurable waste, and it scales badly: a tenth
category means a tenth query, linearly, while `GROUP BY`'s cost barely
changes — the database was already reading every row once regardless of
how many distinct groups exist in it.

### Connection

The real breakdown panel, one row per category actually in use, is built
exactly this way next.

---

## Concept Unit: A Real Category Breakdown Panel

### The Problem

Nothing currently shows category-level totals — a genuinely useful
summary this lesson's user story asks for directly, alongside the plain
`TotalValue` Lesson 30 already built.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryPage.xaml`, `InventoryViewModel.cs`.
- **Change type:** Add.
- **Dependencies:** `GROUP BY`, previous unit; `TotalValue`, Lesson 30.

### The New Code — the Model

```csharp
public class CategoryTotal
{
    public string Category { get; set; } = string.Empty;
    public int ItemCount { get; set; }
    public decimal TotalValue { get; set; }
}
```

### The New Code — Computing the Breakdown

```csharp
public ObservableCollection<CategoryTotal> CategoryTotals
{
    get
    {
        ObservableCollection<CategoryTotal> results = new ObservableCollection<CategoryTotal>();

        using SqliteConnection connection = new SqliteConnection(ConnectionString);
        connection.Open();
        using SqliteCommand command = connection.CreateCommand();
        command.CommandText = "SELECT Category, COUNT(*), SUM(Value) FROM Items WHERE IsArchived = 0 GROUP BY Category";

        using SqliteDataReader reader = command.ExecuteReader();
        while (reader.Read())
        {
            results.Add(new CategoryTotal
            {
                Category = reader.GetString(0),
                ItemCount = reader.GetInt32(1),
                TotalValue = Convert.ToDecimal(reader.GetValue(2))
            });
        }

        return results;
    }
}
```

### The New Code — the Display

```xml
<ItemsControl ItemsSource="{Binding CategoryTotals}" Margin="0,8,0,0">
    <ItemsControl.ItemTemplate>
        <DataTemplate>
            <TextBlock Text="{Binding Category, StringFormat={}{0}: }" FontWeight="SemiBold" />
        </DataTemplate>
    </ItemsControl.ItemTemplate>
</ItemsControl>
```

### Mechanical Walkthrough

- `WHERE IsArchived = 0 GROUP BY Category` — reappearing (`WHERE`,
  familiar since Lesson 21; `GROUP BY`, this lesson's first unit),
  combined in one query — archived items are excluded *before*
  grouping, the same "current inventory only" reasoning `TotalValue`
  already applied.
- `class CategoryTotal` — (first appearance of a plain result-shaping
  class, not persisted anywhere) — exists purely to carry one query's
  result rows into something bindable; it's never saved to SQLite,
  never loaded back — a genuinely temporary shape, built fresh every
  time `CategoryTotals` is read.
- `ItemsControl` — (first appearance) — the most general WPF
  list-displaying control this project has used, with no built-in
  selection, no rows-and-columns structure the way `DataGrid` has —
  appropriate here because this panel is read-only display, nothing a
  user selects or interacts with.

### CS Lens

`CategoryTotal` is a small, honest admission that not every class in
this project needs to model something persisted — some classes exist
purely to shape one query's output for display, structurally similar to
`InventoryItem` in form (plain properties) but genuinely different in
purpose: nothing about `CategoryTotal` round-trips through `INSERT`/
`UPDATE`/`SELECT` the way `InventoryItem` does.

### SE Lens

Why is `CategoryTotals` a property, recomputed on every read, exactly
like `TotalValue`, rather than something maintained incrementally as
items are added or edited? For the identical reason Lesson 30 already
gave: asking the database the question fresh, every time, using the one
operation (`GROUP BY`) built for exactly this, is simpler and more
reliably correct than this project trying to keep five separate running
totals — one per category — correctly synchronized by hand across every
add, edit, archive, and delete this project already has.

### Commands Needed

```bash
dotnet run
```

### Run It

On your Windows machine: the breakdown panel shows one line per category
actually in use, each with its own real total. Add an item in a
not-yet-used category; a new line appears. Archive every item in one
category; that category's line disappears entirely — `GROUP BY` never
produces a row for a group with zero matching rows, the exact behavior
this lesson's own lab already proved.

### Connection

Category totals are real and correctly computed. The next lesson adds
real ordering — a "Top 5 Most Valuable" list and a way to find items
missing a category — both expressed as queries, not C# sorting and
slicing after the fact.

---

## Closing

### Connect the Pieces

`CategoryTotals`' getter runs one `SELECT ... GROUP BY Category` query
— the identical shape proven with real, per-group output in this
lesson's own lab — every time it's read, producing one `CategoryTotal`
per distinct, non-archived category currently in use. Each result row's
`SUM(Value)` inherits the exact same floating-point caveat Lesson 30
already proved and justified for the plain `TotalValue`; nothing new
about that tradeoff is introduced by grouping, only by aggregating in
the first place.

### What Breaks Without This

Temporarily remove `WHERE IsArchived = 0` from `CategoryTotals`'s query,
leaving just `GROUP BY Category`. Archive every item in one category,
rerun, and check the breakdown panel. Real, representative failure: the
now-fully-archived category still shows a line, with its old total —
archived items, meant to be invisible everywhere else in this project,
silently still count here. This is a quiet, easy-to-miss regression, not
a crash — the panel looks entirely plausible, just wrong. Restore the
real `WHERE IsArchived = 0` clause afterward.

### Exercises

- In the `lab-groupby` throwaway pattern, add a fourth item to an
  existing category (for example, a second `"Electronics"` item) and
  confirm, with real output, that its row's `COUNT(*)` and `SUM(Value)`
  both update correctly, still one row per category.
- Predict, in your own words, what `SELECT Category, SUM(Value) FROM Items GROUP BY Category`
  (dropping `COUNT(*)` entirely) would return for the exact same data —
  then confirm which parts of the output change and which don't.
- The real output in this lesson's own lab happened to come out
  alphabetically by category (`Consumables`, `Electronics`, `Tools`) —
  predict, in your own words, whether `GROUP BY` on its own actually
  *guarantees* that ordering, then check by adding a category whose name
  sorts differently than its insertion order and rerunning.

### Definition of Done

- [ ] `CategoryTotals` (`ObservableCollection<CategoryTotal>`) is
      computed via a real `GROUP BY` query, excluding archived items.
- [ ] The breakdown panel shows one line per category actually in use,
      each with its own real item count and total value.
- [ ] A category with zero non-archived items shows no line at all.
- [ ] You reproduced the archived-items-still-counted regression on
      purpose, confirmed it, and restored the real `WHERE` clause.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add a per-category value breakdown via GROUP BY"`.
