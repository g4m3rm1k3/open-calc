# Lesson 14: Either All of It Happens, or None of It Does

**What you will build.** A new file, `ToolDB/ToolRepository.cs`, gives this
project its first real ability to change or remove a row that already
exists in `tools.db` — `UpdateFluteCount`, changing one existing tool's own
flute count, and `Delete`, removing a tool entirely. Both run inside a real
database transaction, proven — not just claimed — to behave as one
indivisible unit: a real, deliberately-forced failure partway through a
transaction is shown to undo every change that transaction already made,
even ones that individually succeeded. The transferable problem underneath
the feature: every real operation this project has performed so far
(`INSERT`, `SELECT`) has been one single statement, succeeding or failing
as a whole on its own. The moment more than one statement needs to happen
together — update this, then that, as one real unit of work — a new
failure mode appears that single statements never had: the first one
succeeding while a later one fails, leaving the database in a state that
was never actually intended, by anyone, at any point.

**What you need to know first.** Lesson 3 — parameterized `SqliteCommand`s
(`SqliteParameter`, `@name`-style placeholders), and why raw string
concatenation into SQL is never written into this project. Lesson 4 —
`SqliteDataReader`, `ExecuteNonQuery()`'s own real return value. Lesson 9 —
`tools`' own real, current schema (`id`, `name`, `vendor_id`,
`overall_diameter`, `overall_length`, `flute_count`), joined against
`vendors`.

**Terms used in this lesson**

- **`UPDATE`** — a real SQL statement that modifies one or more columns on
  every existing row matching a real condition, leaving every other row,
  and every other column on a matched row, untouched. It exists as SQL's
  own dedicated verb for changing data already there — a genuinely
  different real effect from `INSERT` (Lesson 3), which only ever adds a
  brand-new row, or `SELECT` (Lesson 4), which changes nothing at all.
- **`DELETE`** — a real SQL statement that removes every existing row
  matching a real condition, entirely, from a table. It exists as SQL's
  own dedicated verb for real removal — a genuinely different, and more
  severe, real effect than `UPDATE`: a deleted row's own data is gone, not
  merely changed.
- **`WHERE` clause (on `UPDATE`/`DELETE`)** — reappearing from this
  project's own earlier `SELECT` statements, narrowed here to a real,
  different consequence: on a `SELECT`, a `WHERE` clause decides which
  rows are *returned*; on an `UPDATE` or `DELETE`, the identical real
  clause decides which rows are *changed or removed* — the same real
  syntax, a genuinely higher-stakes real job, since an `UPDATE`/`DELETE`
  with no `WHERE` clause at all would match, and modify or delete, every
  row in the table.
- **transaction** — a real, named group of one or more SQL statements that
  the database treats as a single, indivisible unit: either every
  statement inside it takes real, permanent effect, or, if any one of them
  fails, none of them do — not even the ones that individually succeeded
  first. It exists because real work is often naturally more than one
  statement, and a database that only ever guaranteed single-statement
  safety would leave a real, meaningful gap: partial, half-finished work
  that nobody ever actually intended to leave in that exact state.
- **rollback** — the real, deliberate act of undoing every statement a
  still-open transaction has performed so far, restoring the database to
  exactly the state it was in before that transaction began — this
  project's own first real, tested proof that a transaction's own
  guarantee (above) is real, not just a description.
- **commit** — the real, deliberate act of making every statement inside a
  transaction permanent, all at once — the real counterpart to rollback:
  one of these two outcomes, and only one, is how every transaction this
  project writes from here on actually ends.

**Objects and methods used**

- **`SqliteConnection.BeginTransaction()`**
  - *What it is:* this lesson's own new subject — starts a real transaction
    (Terms, above) on an already-open connection.
  - *Implementation:* per Microsoft's own official documentation (fetched
    this session), its real declared shape is `public virtual
    SqliteTransaction BeginTransaction()`, returning a real
    `SqliteTransaction` object — "the transaction," per that same
    documentation's own words — that every statement meant to belong to it
    must be explicitly told about (below).
  - *Its use:* `connection.BeginTransaction()`, this lesson's own third
    unit, both in the isolated lab and in `ToolRepositoryTests.cs`'s own
    real, passing tests.
  - *Type:* an instance method on `SqliteConnection` (established Lesson
    1), returning a real `SqliteTransaction` object.
  - *Responsibility:* mark the real, exact point, in a connection's own
    real sequence of statements, before which nothing this new transaction
    performs can be considered final.
  - *Depends on:* an already-open `SqliteConnection` (established Lesson
    1) — calling it on a closed connection has nothing real to begin a
    transaction on at all.
  - *Connects to:* its own real return value is what every `SqliteCommand`
    meant to run inside this transaction must be given, via that command's
    own `Transaction` property, below — and what `Commit()`/`Rollback()`
    (below) are ultimately called on to end it.
  - *Shape:* the real, single starting point of every transaction this
    project writes — nothing before this call is protected by it; nothing
    after it runs outside of it unless a command deliberately omits being
    told about it.
- **`SqliteCommand(string, SqliteConnection, SqliteTransaction)`**
  - *What it is:* `SqliteCommand` (established Lesson 2) reappearing with a
    real, third constructor parameter this project hasn't used before —
    the transaction a command should run inside.
  - *Implementation:* every earlier `SqliteCommand` in this project has
    used a real, two-parameter constructor (SQL text, connection); this
    lesson's own new code uses a real, three-parameter overload instead,
    the third argument being the exact `SqliteTransaction`
    `BeginTransaction()` (above) already returned.
  - *Its use:* every real `SqliteCommand` inside a transaction, this
    lesson's own `ToolRepository.cs` and `ToolRepositoryTests.cs` alike.
  - *Type:* a constructor overload on `SqliteCommand`.
  - *Responsibility:* associate a specific command with a specific,
    already-open transaction, so the database can tell which statements
    belong to which real unit of work.
  - *Depends on:* a real, currently-open `SqliteTransaction` — passing one
    that's already been committed or rolled back has nothing real left to
    associate with.
  - *Connects to:* every command built this way is what `Commit()`/
    `Rollback()` (below) ultimately affects, together, as one group.
  - *Shape:* the real, per-statement link between an individual command and
    the larger transaction it belongs to — the mechanism that makes "these
    several statements are actually one unit" a real, checkable fact, not
    just a comment in the code.
- **`SqliteTransaction.Commit()`**
  - *What it is:* this lesson's own new subject — makes every statement
    performed inside a transaction real and permanent.
  - *Implementation:* per Microsoft's own official documentation (fetched
    this session), it "Applies the changes made in the transaction" — a
    real, one-way action; once called successfully, nothing about that
    transaction can be undone by calling `Rollback()` afterward.
  - *Its use:* `transaction.Commit();`, this lesson's own first unit's real
    passing test, `UpdateFluteCount_CommitsWhenTransactionSucceeds`.
  - *Type:* an instance method on `SqliteTransaction`.
  - *Responsibility:* end a transaction by making its own real effects
    permanent — nothing about deciding *whether* to commit; that's real
    , surrounding code's own job, shown in this lesson's own third unit.
  - *Depends on:* a still-open transaction with no prior `Commit()` or
    `Rollback()` already called on it.
  - *Connects to:* called once, at the real end of a transaction's own
    success path — every `SqliteCommand` associated with this transaction
    (above) is what its own effects actually consist of.
  - *Shape:* one of exactly two real ways a transaction this project
    writes can end — `Rollback()`, below, being the other.
- **`SqliteTransaction.Rollback()`**
  - *What it is:* this lesson's own culminating subject — undoes every
    statement performed inside a still-open transaction.
  - *Implementation:* per Microsoft's own official documentation (fetched
    this session), it "Reverts the changes made in the transaction" — real,
    total reversal, restoring the database to exactly its own state before
    that transaction's first statement ran, regardless of how many
    individual statements inside it had already, on their own, succeeded.
    That same documentation states a related, real fact worth knowing:
    disposing a `SqliteTransaction` that was never explicitly committed
    "rolls it back" automatically — real safety this lesson's own code
    doesn't rely on, calling `Rollback()` explicitly instead, but a real,
    honest fallback this project's own established `using` idiom (Lesson
    1) already benefits from regardless.
  - *Its use:* `transaction.Rollback();`, this lesson's own third unit's
    real, isolated lab, and `ToolRepositoryTests.cs`'s own real, passing
    test, `UpdateFluteCount_RollsBackWhenLaterStatementFails`.
  - *Type:* an instance method on `SqliteTransaction`.
  - *Responsibility:* undo, completely, every real effect every command
    associated with this transaction has produced — an all-or-nothing real
    reversal, never a partial one.
  - *Depends on:* a still-open transaction — calling it after `Commit()`
    has already run has nothing left to undo.
  - *Connects to:* called from a real `catch` block, this lesson's own
    third unit, the moment a later statement in the same transaction throws
    a real `SqliteException`.
  - *Shape:* the other of the exactly two real ways a transaction this
    project writes can end — the one this lesson's own entire feature
    exists to prove really works.

**Everything else in the file, not this lesson's own subject but still
explained**

- **`SqliteParameter`/`@name`-style placeholders**
  - *What it is:* reappearing from Lesson 3 — a real, named placeholder in
    a SQL string, bound to a real value separately from that string itself,
    so user or application data is never concatenated directly into SQL
    text.
  - *Implementation:* established Lesson 3, unchanged.
  - *Its use:* every real value `ToolRepository.cs`'s own new `UPDATE`/
    `DELETE` statements need (`@fluteCount`, `@id`) is bound this same,
    already-established way — this project's own "never let data become
    code" rule (Lesson 3) applies exactly as much to `UPDATE`/`DELETE` as
    it always has to `INSERT`.
- **`ExecuteNonQuery()`**
  - *What it is:* reappearing from Lesson 2/3 — runs a real SQL statement
    that doesn't return rows, returning instead a real count of affected
    rows.
  - *Implementation:* established Lesson 2/3, unchanged.
  - *Its use:* both of `ToolRepository.cs`'s own new methods call it,
    exactly the way this project's own earlier `INSERT` calls already have
    — `UPDATE` and `DELETE`, like `INSERT`, never return rows of their own.
- **`ExecuteScalar()`**
  - *What it is:* reappearing from this project's own earlier lessons — runs
    a real query and returns only its own single first value, rather than a
    full real reader.
  - *Implementation:* established previously, unchanged.
  - *Its use:* `ToolRepositoryTests.cs`'s own real tests use it to read
    back one real column's own value after a transaction ends, to prove
    what actually persisted.

---

## Concept Unit: `UPDATE` — Changing a Row That Already Exists

### The Problem

Every tool this project has ever created has been created once, correctly,
and never modified again. Nothing in `ToolDB` can yet change a real value
on a row that already exists — if a tool's own real flute count needs
correcting, nothing this project has built so far can do that.

> **Try this first:** Lesson 3's own real `INSERT` already uses a
> parameterized `SqliteCommand` with `@name`-style placeholders to safely
> place a real value into a new row. Given SQL's own `UPDATE` statement
> targets *existing* rows instead of creating new ones, and needs a real
> way to say *which* existing row(s) to change — the same real job a
> `SELECT`'s own `WHERE` clause (Lesson 4, 9) already does for choosing
> which rows to return — what shape would you expect a real, parameterized
> `UPDATE tools SET flute_count = ... WHERE id = ...` statement to take,
> reusing pieces this project has already proven safe?

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/ToolRepository.cs`, created.
- **Change type** — add (one new file, one new method).
- **Location** — new file, sitting alongside `Tool.cs` in `ToolDB/`.
- **Dependencies** — `tools.db`'s own real, current schema (Lesson 9).

### The New Code

```csharp
public static void UpdateFluteCount(SqliteConnection connection, SqliteTransaction transaction, int id, int newFluteCount)
{
    using var command = new SqliteCommand(
        "UPDATE tools SET flute_count = @fluteCount WHERE id = @id",
        connection,
        transaction);
    command.Parameters.AddWithValue("@fluteCount", newFluteCount);
    command.Parameters.AddWithValue("@id", id);
    command.ExecuteNonQuery();
}
```

### The Updated Project

`ToolRepository.cs`, in full (a brand-new file, nothing to mark as
changed):

```csharp
 1  using Microsoft.Data.Sqlite;
 2
 3  public static class ToolRepository
 4  {
 5      public static void UpdateFluteCount(SqliteConnection connection, SqliteTransaction transaction, int id, int newFluteCount)
 6      {
 7          using var command = new SqliteCommand(
 8              "UPDATE tools SET flute_count = @fluteCount WHERE id = @id",
 9              connection,
10              transaction);
11          command.Parameters.AddWithValue("@fluteCount", newFluteCount);
12          command.Parameters.AddWithValue("@id", id);
13          command.ExecuteNonQuery();
14      }
15  }
```

`ToolRepository` is a real, brand-new `static` class — this project's own
first, established since Lesson 8's own `record`/`class` distinction
already covered what `static` means for a *member*; here, the *class*
itself is `static`, meaning it can never be instantiated with `new` at
all — every one of its own methods is called directly on the class name,
`ToolRepository.UpdateFluteCount(...)`, never on an object. This class
exists specifically to hold real methods that change `tools.db`'s own
data, requiring an explicit transaction (this lesson's own third unit)
rather than opening or managing one internally — a real, deliberate design
choice this unit's own SE Lens, below, explains.

### Proving It in Isolation

A minimal, unrelated throwaway table, isolating a parameterized `UPDATE`
before it meets this project's own real `tools` table:

```csharp
new SqliteCommand("CREATE TABLE widgets (id INTEGER PRIMARY KEY, price REAL NOT NULL)", connection).ExecuteNonQuery();
new SqliteCommand("INSERT INTO widgets (id, price) VALUES (1, 9.99)", connection).ExecuteNonQuery();

using var updateCommand = new SqliteCommand("UPDATE widgets SET price = @price WHERE id = @id", connection);
updateCommand.Parameters.AddWithValue("@price", 12.50);
updateCommand.Parameters.AddWithValue("@id", 1);
int rowsAffected = updateCommand.ExecuteNonQuery();
Console.WriteLine($"Rows affected: {rowsAffected}");
```

Run for real this session:

```
Rows affected: 1
```

This real output proves two things at once: the real `UPDATE` actually
matched and changed exactly the one real row whose `id` was `1` (`Rows
affected: 1`, not `0` or some other count), and `ExecuteNonQuery()`'s own
real return value (established Lesson 2) is exactly that count — the same
real mechanism already proven for `INSERT`, now confirmed for `UPDATE`
too.

### Discard the Throwaway Example

The `widgets` example above is discarded now — it never appears in this
project again. What's proven is that a parameterized `UPDATE` really does
change only the matched row's own targeted column, leaving everything
else untouched — not this specific price change.

### Mechanical Walkthrough

- `public static void UpdateFluteCount(SqliteConnection connection,
  SqliteTransaction transaction, int id, int newFluteCount)` — a real
  `static` method, first appearing on this new class — takes an
  already-open `SqliteConnection` (established Lesson 1) and an
  already-begun `SqliteTransaction` (this lesson's own third unit) as real
  parameters, rather than creating either one itself; `id` and
  `newFluteCount` are the real values this specific operation needs.
- `new SqliteCommand("UPDATE tools SET flute_count = @fluteCount WHERE id
  = @id", connection, transaction)` — `SqliteCommand` (Header, above),
  reappearing with its real, three-parameter constructor — the SQL text
  names `UPDATE` (Terms, above), a real `SET` clause naming exactly one
  column to change, and a real `WHERE` clause (Terms, above) restricting
  the change to one specific row.
- `command.Parameters.AddWithValue("@fluteCount", newFluteCount);` and
  `command.Parameters.AddWithValue("@id", id);` — reappearing from Lesson
  3 — each real C# value bound to its own named placeholder, never
  concatenated into the SQL string itself.
- `command.ExecuteNonQuery();` — `ExecuteNonQuery()` (Header, above),
  reappearing — runs the real `UPDATE`, returning a real affected-row
  count this method itself doesn't read or return further.

### CS Lens

`UPDATE`'s own real behavior — locate existing state by a real condition,
then change only what's named, leaving everything else exactly as it was
— is the same real idea as a **targeted mutation**: changing one specific
part of a larger, already-existing structure without rebuilding the whole
thing. Also recognized in: a C# object's own property setter (`tool.Name =
"..."`, this project's own real aliasing lab, Lesson 8) changing one field
while every other field stays untouched, a word processor's own
find-and-replace changing only matched text, and a spreadsheet formula
recalculating one specific cell without redrawing the entire sheet.

### SE Lens

Why does `UpdateFluteCount` take an already-open `connection` and
`transaction` as real parameters, rather than opening its own connection
internally the way, say, this project's own early `LabScratch` scripts
always have? The alternative not chosen — managing its own connection —
was rejected because this lesson's own entire point (its own third unit)
is letting more than one repository method share *one* real transaction;
a method that insists on managing its own connection and transaction
internally could never participate in a larger, multi-step unit of work
alongside another call, which is exactly the real capability this lesson
sets out to prove exists. The honest cost: every caller of
`UpdateFluteCount` is now responsible for opening a real connection and
beginning a real transaction itself, correctly, before calling it — this
method trusts its own caller entirely, rather than protecting against a
caller that gets that part wrong.

### Run It

A real `dotnet build` was run this session against the actual new file:
build succeeded, 0 Warnings, 0 Errors. The throwaway `widgets` example
above was run for real this session with `dotnet run`, real output shown;
source and output are saved in this project's own `verification/lesson-14/`
folder (`lab1-2-update-delete.cs`), covering both this unit's own `UPDATE`
half and the next unit's own `DELETE` half in one real, batched run, per
this schema's own Verification Rule. This unit's own real method,
`UpdateFluteCount`, is proven a second time in this lesson's own third
unit, where it's actually called from a real, passing test.

### Connecting Back

A real way to change an existing tool's own data now exists — but nothing
yet removes one entirely. The next unit adds that.

---

## Concept Unit: `DELETE` — Removing a Row Entirely

### The Problem

Nothing in this project can yet remove a tool from `tools.db` at all — once
a row exists, it exists permanently, with no real way to take it back out
short of editing the database file directly outside this application
entirely.

> **Try this first:** the Header's own `DELETE` entry names it as a real,
> more severe operation than `UPDATE` — removal, not modification. Given
> `UPDATE`'s own real shape, this lesson's own first unit, already needed a
> `WHERE` clause to target one specific row rather than every row in the
> table, what real, structural risk would an `UPDATE` or `DELETE`
> statement with *no* `WHERE` clause at all actually carry — and why would
> that risk matter even more for `DELETE` than for `UPDATE`?

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/ToolRepository.cs`, modified.
- **Change type** — add (one new method).
- **Location** — inside `ToolRepository`, established the previous unit,
  alongside `UpdateFluteCount`.
- **Dependencies** — none beyond `ToolRepository`'s own existing shape.

### The New Code

```csharp
public static void Delete(SqliteConnection connection, SqliteTransaction transaction, int id)
{
    using var command = new SqliteCommand(
        "DELETE FROM tools WHERE id = @id",
        connection,
        transaction);
    command.Parameters.AddWithValue("@id", id);
    command.ExecuteNonQuery();
}
```

### The Updated Project

`ToolRepository.cs`, in full, new lines marked:

```csharp
 1  using Microsoft.Data.Sqlite;
 2
 3  public static class ToolRepository
 4  {
 5      public static void UpdateFluteCount(SqliteConnection connection, SqliteTransaction transaction, int id, int newFluteCount)
 6      {
 7          using var command = new SqliteCommand(
 8              "UPDATE tools SET flute_count = @fluteCount WHERE id = @id",
 9              connection,
10              transaction);
11          command.Parameters.AddWithValue("@fluteCount", newFluteCount);
12          command.Parameters.AddWithValue("@id", id);
13          command.ExecuteNonQuery();
14      }
15
16      public static void Delete(SqliteConnection connection, SqliteTransaction transaction, int id)         // ← new
17      {                                                                                                     // ← new
18          using var command = new SqliteCommand(                                                            // ← new
19              "DELETE FROM tools WHERE id = @id",                                                            // ← new
20              connection,                                                                                    // ← new
21              transaction);                                                                                  // ← new
22          command.Parameters.AddWithValue("@id", id);                                                        // ← new
23          command.ExecuteNonQuery();                                                                        // ← new
24      }                                                                                                      // ← new
25  }
```

`ToolRepository` now offers two real ways to change existing data instead
of one — both requiring the identical real `connection`/`transaction`
pair, both parameterized, both relying on `ExecuteNonQuery()`'s own
already-established real behavior.

### Proving It in Isolation

The same throwaway `widgets` table, isolating a parameterized `DELETE`
this time:

```csharp
using var deleteCommand = new SqliteCommand("DELETE FROM widgets WHERE id = @id", connection);
deleteCommand.Parameters.AddWithValue("@id", 1);
int rowsAffected = deleteCommand.ExecuteNonQuery();
Console.WriteLine($"Rows affected: {rowsAffected}");

using var checkCommand = new SqliteCommand("SELECT COUNT(*) FROM widgets", connection);
var remaining = checkCommand.ExecuteScalar();
Console.WriteLine($"Rows remaining: {remaining}");
```

Run for real this session:

```
Rows affected: 1
Rows remaining: 0
```

This real output proves `DELETE`'s own real, total removal: not only did
one row register as affected, a real, immediate follow-up `SELECT COUNT(*)`
confirms zero rows remain in the entire table — genuinely gone, not merely
changed the way this lesson's own first unit's `UPDATE` left `widgets`
still holding one row with a new price.

### Discard the Throwaway Example

The `widgets` example above is discarded now, for the second and final
time — it never appears in this project again. What's proven is `DELETE`'s
own real, total-removal behavior, contrasted directly against `UPDATE`'s
own partial-change behavior.

### Mechanical Walkthrough

- `public static void Delete(SqliteConnection connection, SqliteTransaction
  transaction, int id)` — a real `static` method, matching
  `UpdateFluteCount`'s own real parameter shape exactly, minus the value
  being changed (`DELETE` removes a whole row; there's no second value to
  set).
- `new SqliteCommand("DELETE FROM tools WHERE id = @id", connection,
  transaction)` — the real, three-parameter `SqliteCommand` constructor
  (Header, above), reused — the SQL text names `DELETE FROM tools`
  (Terms, above) and a real `WHERE` clause (Terms, above), identical in
  shape to `UPDATE`'s own, restricting removal to one specific row.
- `command.Parameters.AddWithValue("@id", id);` — the identical real
  parameter-binding mechanism (Lesson 3) already used throughout this
  project.
- `command.ExecuteNonQuery();` — `ExecuteNonQuery()` (Header, above),
  reappearing — runs the real `DELETE`, its own real affected-row count
  discarded here exactly the way `UpdateFluteCount`'s own is.

### CS Lens

`DELETE`'s own real, total-removal behavior — once it runs, that row's own
data is genuinely gone, not recoverable from within this application — is
a specific instance of a **destructive operation**: one whose own real
effect cannot be reversed by any ordinary, later operation, only by a
transaction's own rollback (this lesson's own third unit) while it's still
possible, or a real, separate backup taken beforehand. Also recognized in:
this project's own established file-system convention (`File.Delete`,
Lesson 2–9) — once a file is deleted, no ordinary C# call brings it back —
and shredding a physical paper document, as opposed to merely crossing out
one line on it.

### SE Lens

Why does this project add a real `Delete` method at all, rather than a
softer alternative many real applications use instead — an `is_deleted`
flag column, leaving the row physically present but hidden from ordinary
queries (a real, common pattern sometimes called "soft delete")? The
alternative not chosen — a flag column — was rejected here, for this
lesson's own real scope, because it would require a real schema change
(a new column, Lesson 2's own concept) and every existing query in this
project (`SELECT`s in `MainWindow.xaml.cs`, Lesson 4/9) to be updated to
respect that flag, a genuinely larger change than this lesson's own real
subject (transactions and rollback) calls for. The honest cost accepted
by choosing real, permanent `DELETE` instead: there is no way, from within
this application, to recover a tool once its own transaction has
committed — only a rollback, while that transaction is still open, or a
real, separate database backup, can undo it after the fact.

### Run It

A real `dotnet build` was run this session against the actual, modified
file: build succeeded, 0 Warnings, 0 Errors. The throwaway `widgets`
example above was run for real this session, real output shown, in the
same batched run as the previous unit's own `UPDATE` half (saved as
`verification/lesson-14/lab1-2-update-delete.cs`). This unit's own real
method, `Delete`, is proven a second time in this lesson's own third unit,
where a real, passing test (`Delete_CommitsWhenTransactionSucceeds`)
calls it directly.

### Connecting Back

`ToolRepository` can now both change and remove real, existing data — but
neither method has been shown running as part of the real, multi-statement
unit of work this whole lesson exists to protect. The final unit proves
that protection is real.

---

## Concept Unit: One Failure Undoes Everything — Transactions and Rollback

### The Problem

`UpdateFluteCount` and `Delete`, as written, each run their own single
`ExecuteNonQuery()` call — safe individually, the same way this project's
own earlier `INSERT` always has been. But nothing yet protects a case
where *two or more* statements need to succeed *together*, as one real
unit: if a future real feature ever needs to, say, update one tool and
delete another as a single logical action, and the second statement fails
for any reason, the first one — having already run — would stay real and
permanent, leaving the database in a state nobody actually intended.

> **Try this first:** the Header's own **transaction** entry describes a
> real group of statements treated as one indivisible unit — succeed
> completely, or fail completely, never partially. Given `UpdateFluteCount`
> already accepts a `SqliteTransaction` parameter it does nothing with
> beyond handing it to `SqliteCommand`'s own constructor, and given
> `SqliteConnection.BeginTransaction()` (Header, above) is what actually
> produces one — what real, concrete difference would you predict between
> running two statements on a plain connection with no transaction at all,
> versus running the identical two statements after a real
> `BeginTransaction()` call, if the *second* statement fails partway
> through?

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB.Tests/ToolRepositoryTests.cs`, created.
- **Change type** — add (one new test file, three real `[Fact]` tests).
- **Location** — new file, sitting alongside `ToolTests.cs` in
  `ToolDB.Tests/`.
- **Dependencies** — `ToolRepository`'s own two real methods, established
  this lesson's own first two units.

### The New Code

```csharp
using (var transaction = connection.BeginTransaction())
{
    ToolRepository.UpdateFluteCount(connection, transaction, 1, 99);

    using var badCommand = new SqliteCommand(
        "UPDATE tools SET nonexistent_column = 1 WHERE id = 1",
        connection,
        transaction);

    Assert.Throws<SqliteException>(() => badCommand.ExecuteNonQuery());
    transaction.Rollback();
}
```

### The Updated Project

`ToolDB.Tests/ToolRepositoryTests.cs`, in full (a brand-new file, nothing
to mark as changed):

```csharp
 1  using Microsoft.Data.Sqlite;
 2
 3  public class ToolRepositoryTests
 4  {
 5      private static SqliteConnection CreateTestDatabase(string path)
 6      {
 7          if (File.Exists(path))
 8          {
 9              File.Delete(path);
10          }
11
12          var connection = new SqliteConnection($"Data Source={path}");
13          connection.Open();
14
15          new SqliteCommand("CREATE TABLE vendors (id INTEGER PRIMARY KEY, name TEXT NOT NULL)", connection).ExecuteNonQuery();
16          new SqliteCommand("INSERT INTO vendors (name) VALUES ('Test Tooling Co.')", connection).ExecuteNonQuery();
17          new SqliteCommand("CREATE TABLE tools (id INTEGER PRIMARY KEY, name TEXT NOT NULL, vendor_id INTEGER REFERENCES vendors(id), overall_diameter REAL NOT NULL, overall_length REAL NOT NULL, flute_count INTEGER NOT NULL)", connection).ExecuteNonQuery();
18          new SqliteCommand("INSERT INTO tools (name, vendor_id, overall_diameter, overall_length, flute_count) VALUES ('Test End Mill', 1, 0.5, 3.0, 4)", connection).ExecuteNonQuery();
19
20          return connection;
21      }
22
23      [Fact]
24      public void UpdateFluteCount_CommitsWhenTransactionSucceeds()
25      {
26          using var connection = CreateTestDatabase("test_update_commit.db");
27
28          using (var transaction = connection.BeginTransaction())
29          {
30              ToolRepository.UpdateFluteCount(connection, transaction, 1, 6);
31              transaction.Commit();
32          }
33
34          using var selectCommand = new SqliteCommand("SELECT flute_count FROM tools WHERE id = 1", connection);
35          var fluteCount = selectCommand.ExecuteScalar();
36
37          Assert.Equal(6L, fluteCount);
38      }
39
40      [Fact]                                                                                                  // ← new
41      public void UpdateFluteCount_RollsBackWhenLaterStatementFails()                                        // ← new
42      {                                                                                                        // ← new
43          using var connection = CreateTestDatabase("test_update_rollback.db");                               // ← new
44
45          using (var transaction = connection.BeginTransaction())                                             // ← new
46          {                                                                                                    // ← new
47              ToolRepository.UpdateFluteCount(connection, transaction, 1, 99);                                 // ← new
48
49              using var badCommand = new SqliteCommand(                                                        // ← new
50                  "UPDATE tools SET nonexistent_column = 1 WHERE id = 1",                                      // ← new
51                  connection,                                                                                  // ← new
52                  transaction);                                                                                 // ← new
53
54              Assert.Throws<SqliteException>(() => badCommand.ExecuteNonQuery());                              // ← new
55              transaction.Rollback();                                                                          // ← new
56          }                                                                                                     // ← new
57
58          using var selectCommand2 = new SqliteCommand("SELECT flute_count FROM tools WHERE id = 1", connection); // ← new
59          var fluteCountAfterRollback = selectCommand2.ExecuteScalar();                                        // ← new
60
61          Assert.Equal(4L, fluteCountAfterRollback);                                                          // ← new
62      }
63
64      [Fact]
65      public void Delete_CommitsWhenTransactionSucceeds()
66      {
67          using var connection = CreateTestDatabase("test_delete_commit.db");
68
69          using (var transaction = connection.BeginTransaction())
70          {
71              ToolRepository.Delete(connection, transaction, 1);
72              transaction.Commit();
73          }
74
75          using var selectCommand = new SqliteCommand("SELECT COUNT(*) FROM tools WHERE id = 1", connection);
76          var remaining = selectCommand.ExecuteScalar();
77
78          Assert.Equal(0L, remaining);
79      }
80  }
```

Three real, passing tests now exist: the first proves a successful
transaction's own changes really do persist after `Commit()`; the third
proves the identical shape for `Delete`; the second — this unit's own real
subject — proves that even though `UpdateFluteCount(..., 99)` on line 47
genuinely ran and would have changed `flute_count` to `99` on its own, the
deliberately invalid second statement's own real failure, caught and
followed by `transaction.Rollback()`, undid it — line 61's own real
assertion confirms `flute_count` is still `4`, its original value, never
`99`.

### Proving It in Isolation

A minimal, unrelated throwaway table, isolating `BeginTransaction`/
`Commit`/`Rollback` before they meet this project's own real `tools` table:

```csharp
new SqliteCommand("CREATE TABLE counters (id INTEGER PRIMARY KEY, value INTEGER NOT NULL)", connection).ExecuteNonQuery();
new SqliteCommand("INSERT INTO counters (id, value) VALUES (1, 10)", connection).ExecuteNonQuery();

using (var transaction = connection.BeginTransaction())
{
    using var updateCommand = new SqliteCommand(
        "UPDATE counters SET value = 100 WHERE id = 1", connection, transaction);
    updateCommand.ExecuteNonQuery();

    try
    {
        using var badCommand = new SqliteCommand(
            "UPDATE counters SET nonexistent_column = 1 WHERE id = 1", connection, transaction);
        badCommand.ExecuteNonQuery();
        transaction.Commit();
    }
    catch (SqliteException ex)
    {
        Console.WriteLine($"Second statement failed: {ex.Message}");
        transaction.Rollback();
    }
}

using var selectCommand = new SqliteCommand("SELECT value FROM counters WHERE id = 1", connection);
var finalValue = selectCommand.ExecuteScalar();
Console.WriteLine($"Final value after rollback: {finalValue}");
```

Run for real this session:

```
Second statement failed: SQLite Error 1: 'no such column: nonexistent_column'.
Final value after rollback: 10
```

This real, captured output is this lesson's own central proof: the first
statement, `UPDATE counters SET value = 100`, genuinely ran — SQLite
itself doesn't know yet that anything will go wrong when it executes that
one statement. The second, deliberately invalid statement then throws a
real `SqliteException` (its own real, captured message quoted above,
naming the exact real reason: `no such column`). Calling `transaction
.Rollback()` afterward doesn't just stop future statements — it reverts
the *already-successful* first one too: the real, final `SELECT` reads
back `10`, the original value, never `100`. Nothing about this is
predicted or assumed; it's exactly what real, captured output shows.

### Discard the Throwaway Example

The `counters` example above is discarded now — it never appears in this
project again. What's proven is that a transaction's own rollback really
does undo an earlier, individually-successful statement, not only prevent
future ones — the same real mechanics `ToolRepositoryTests.cs`'s own real,
permanent test proves a second time, against this project's own real
`tools` shape.

### Mechanical Walkthrough

- `connection.BeginTransaction()` — `SqliteConnection.BeginTransaction()`
  (Header, above) — starts a real transaction, returning a real
  `SqliteTransaction` object held in the local variable `transaction`.
- `using (var transaction = ...)` — the `using` statement (established
  Lesson 1 for `SqliteConnection`), applied here to a `SqliteTransaction` —
  per this lesson's own Header entry on `Rollback()`, disposing an
  uncommitted transaction rolls it back automatically; this lesson's own
  code never actually relies on that fallback, calling `Rollback()`
  explicitly instead, but it's real, honest safety net this exact `using`
  shape provides regardless.
- `ToolRepository.UpdateFluteCount(connection, transaction, 1, 99)` — this
  lesson's own first unit's real method, called with the real, just-begun
  `transaction` — this is the real "individually successful first
  statement" this unit's own Socratic question and isolated lab both
  center on.
- `new SqliteCommand("UPDATE tools SET nonexistent_column = 1 WHERE id =
  1", connection, transaction)` — a real, deliberately invalid `SqliteCommand`
  — `nonexistent_column` names no real column `tools` actually has, chosen
  specifically to force a genuine, real failure rather than simulate one.
- `Assert.Throws<SqliteException>(() => badCommand.ExecuteNonQuery());` —
  a real xUnit assertion (established Lesson 4), confirming the real,
  expected `SqliteException` genuinely occurs when this specific invalid
  statement runs — not merely assumed to occur.
- `transaction.Rollback();` — `SqliteTransaction.Rollback()` (Header,
  above), this lesson's own culminating call — undoes both statements'
  own real effects, even though only the second one actually failed.
- `Assert.Equal(4L, fluteCountAfterRollback);` — a real xUnit assertion,
  confirming `flute_count` genuinely reverted to its original real value —
  the actual, tested proof this entire lesson exists to establish.

### CS Lens

A transaction's own real guarantee — every statement inside it takes
effect, or none do, with no real state in between ever left standing — is
a specific instance of **atomicity**: an operation treated as a single,
indivisible unit, with no observable partial completion possible from
outside it. Also recognized in: a bank wire transfer (debiting one real
account and crediting another must both happen, or neither, or money
either vanishes or is created from nothing), a C# object's own constructor
(Lesson 13) either fully completing or the object simply not existing at
all — never a half-constructed object visible to other code — and an
all-or-nothing software installation that rolls back every file it already
copied if a later step fails partway through.

### SE Lens

Why does this lesson prove rollback using a *deliberately broken* second
statement (an invalid column name), rather than only testing the success
path (this unit's own first and third tests)? The alternative not chosen —
testing success alone — was rejected because a transaction's own real,
load-bearing promise is specifically about what happens when something
goes wrong; a test suite that only ever exercises the happy path can't
distinguish "this genuinely rolls back correctly" from "this happens to
work because nothing ever fails in testing" — exactly this project's own
already-established testing philosophy (Lesson 4's own deliberately
swapped-ordinal "what breaks" demo). The honest cost: writing a test that
deliberately, correctly fails partway through takes more real code than
testing success alone would, and requires genuinely understanding *why*
the forced failure happens, not just that it does.

### Run It

A real `dotnet test` was run this session against the actual, new test
file: all three new tests passed, alongside this project's own existing,
unrelated `ToolTests.cs` test — four total, zero failures. The throwaway
`counters` example above was run for real this session with `dotnet run`,
real output shown and quoted above; source and output are saved in this
project's own `verification/lesson-14/`
folder (`lab3-transaction-rollback.cs`), following the same persistent-
verification convention established in this project's own Lesson 11.

### Connecting Back

This lesson's own entire real claim — that a transaction really does
protect multi-statement work as one indivisible unit — is no longer just
described; it's proven, twice, with real, captured output and a real,
passing automated test that deliberately forces the exact failure this
lesson opened by describing.

---

## Connect the Pieces

One concrete trace, start to finish, through everything this lesson built:

1. `ToolRepository.UpdateFluteCount` gave this project its first real way
   to change an existing tool's own data — a parameterized `UPDATE`,
   proven against a throwaway `widgets` table to affect exactly the one
   real row its own `WHERE` clause names (Unit 1).
2. `ToolRepository.Delete` gave this project its first real way to remove
   a tool entirely — the same real parameterized shape, proven against the
   same throwaway table to leave zero rows behind, a genuinely more severe
   real effect than `UPDATE`'s own partial change (Unit 2).
3. A real, isolated `counters` example proved, with real captured output,
   that `BeginTransaction()`/`Rollback()` genuinely undo an
   individually-successful first statement the moment a second statement
   in the same transaction fails — not merely stopping further statements,
   but reverting ones that had already, on their own, succeeded (Unit 3).
4. `ToolDB.Tests/ToolRepositoryTests.cs` proved the identical real behavior
   a second time, permanently, against this project's own real `tools`
   shape — one test confirming `Commit()` makes real changes permanent,
   one deliberately forcing a real failure and confirming `Rollback()`
   undoes an already-successful `UpdateFluteCount` call, and one
   confirming the identical commit behavior for `Delete` (Unit 3).

**Next lesson:** 15 — Constraints & Data Integrity.
