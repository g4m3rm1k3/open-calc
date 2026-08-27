# Lesson 22: Teaching the Database to React to Itself (Triggers)

**What you will build.** A new, real, permanent `last_modified` column on
`tools`, backfilled once for this project's own one real existing row,
then kept current automatically from now on by a new, real, permanent
`CREATE TRIGGER trg_tools_last_modified` — fires on every real `UPDATE`
to `tools`, with zero C# code anywhere ever mentioning it. The
transferable problem underneath the feature: how does a database
guarantee a real, automatic side effect happens on *every* real write,
from *any* real client, without depending on every real write path
remembering to do it correctly?

**What you need to know first.** Schema Design — the real
`ALTER TABLE`/backfill pattern this lesson reuses to add the new column.
Updating and Deleting Safely — the real `UPDATE` methods
(`UpdateFluteCount`, `UpdateTool`) this lesson's new trigger silently
attaches to, and the real transaction/rollback machinery Unit 2 proves
the trigger's own side effect participates in. Constraints & Data
Integrity — the real `sqlite_schema` inspection pattern this lesson
reuses to confirm the trigger exists.

**Terms used in this lesson**

- **trigger** — a real, named database object that runs automatically in
  response to a real write, never called directly by name from C# or
  from any other real client. Per sqlite.org's own real, fetched
  documentation (`lang_createtrigger.html`), "Triggers are database
  operations that are automatically performed when a specified database
  event occurs."
- **`CREATE TRIGGER`** — the real SQL statement that builds one.
- **`AFTER`** — one of two real timing keywords a trigger declares. Per
  that same real, fetched documentation, "The BEFORE or AFTER keyword
  determines when the trigger actions will be executed relative to the
  insertion, modification or removal of the associated row" — `AFTER`
  means the real row change has already genuinely happened by the time
  the trigger's own body runs.
- **`NEW`** — a real reference, valid only inside a trigger body, to the
  just-written row's own new column values. Per that same real, fetched
  documentation, for an `UPDATE` trigger specifically, "NEW and OLD
  references are valid" — this lesson's own trigger reads `NEW.id` to
  know which real row it just affected.
- **event-driven** — a real style of programming where code runs in
  direct response to something happening (a real database write, a real
  UI click), rather than being called directly by name — this project's
  own real `AboutButton_Click`/`Browser_WebMessageReceived` handlers
  already work this way at the C# layer; this lesson brings the identical
  real idea into SQL itself.
- **side effect** — a real, automatic additional change caused by an
  operation, beyond whatever its own caller explicitly asked for. This
  lesson's own trigger is a real side effect made concrete: calling
  `ToolRepository.UpdateFluteCount` only asks to change `flute_count`,
  but a second, real column change happens too, invisibly, unless a
  reader specifically knows to look for it.
- **recursive trigger** — a real trigger whose own body performs a write
  that would, if allowed, cause that same trigger to fire again. Per
  sqlite.org's own real, fetched documentation on the `recursive_triggers`
  setting, real support for this "was added in version 3.6.18 but was
  initially turned OFF by default, for compatibility" — meaning, by
  real, current default, a trigger's own internal write does **not**
  re-fire itself, a real, load-bearing fact this lesson's own second
  unit proves directly rather than assumes.

**Objects and methods used**

**Everything else in the file, not this lesson's own subject but still
explained**

- **`SqliteCommand.ExecuteNonQuery` / `.ExecuteScalar`**
  - *What it is:* reappearing — the real method that runs a real SQL
    statement expected to return no rows, and the real method that runs
    one expected to return a single real value.
  - *Implementation:* established when parameterized writes and
    single-value lookups were first introduced into this project,
    unchanged.
  - *Its use:* this lesson's own real `ALTER TABLE`/backfill/
    `CREATE TRIGGER` statements each run via `ExecuteNonQuery`; this
    lesson's own new tests read `last_modified` back via
    `ExecuteScalar`.
  - *Type:* both are real instance methods on `SqliteCommand`.
  - *Responsibility:* `ExecuteNonQuery`'s full real charter is running a
    real statement and reporting how many real rows it changed, nothing
    about their own values; `ExecuteScalar`'s full real charter is
    running a real query and returning only its own first real column of
    its own first real row, nothing more.
  - *Depends on:* a real, already-open `SqliteConnection`.
  - *Connects to:* `ExecuteScalar`'s own real return value is cast and
    compared directly in this lesson's own two new tests.
  - *Shape:* this project's own established real ADO.NET seam, reused
    as-is.
- **`Assert.NotEqual`**
  - *What it is:* a real xUnit assertion, the real logical opposite of
    `Assert.Equal` (established when this project's own first automated
    test was written) — fails a real test if its own two real arguments
    are equal.
  - *Implementation:* `Assert.NotEqual<T>(T expected, T actual)` — a real
    generic method, comparing two real values of the identical real
    type.
  - *Its use:* `UpdateFluteCount_AlsoUpdatesLastModified_ViaTrigger`'s
    own real proof that `last_modified` genuinely changed from its own
    seeded value, without needing to predict or assert the exact real
    timestamp string a real trigger would produce.
  - *Type:* a real, `static`, generic method on the real `Assert` class.
  - *Responsibility:* report a real, precise test failure the moment two
    real values that were expected to differ turn out identical.
  - *Depends on:* two real, already-computed values to compare.
  - *Connects to:* called once, at the very end of this lesson's own new
    test, against `last_modified`'s own real, freshly-read value and the
    literal real string `"2020-01-01"` seeded by `CreateTestDatabase`.
  - *Shape:* the same real assertion-library seam this project's tests
    have used since its own very first automated test — unchanged by
    this lesson.

---

## Concept Unit: `CREATE TRIGGER` — Making the Database React to Its Own Writes

### The Problem

None of `tools.db`'s own six real columns has ever recorded *when* a row
last changed — not even after Updating and Deleting Safely gave this
project real `UPDATE` capability, or after Two-Way Communication Across
the Split let a real user edit a tool through the real Edit dialog. If a
future real workflow — this project's own real, stated end goal is a
multi-user PDM app — ever needed to know which real tool changed most
recently, nothing in this project's own current, real schema could
answer that.

> **Try this first:** if you added a `last_modified` column and wanted
> every real `UPDATE` to stamp it automatically, where would you
> naturally think to put that logic first — inside `ToolRepository`'s
> own C# methods, or somewhere else? What happens to that real guarantee
> the day a future real `UPDATE` method gets added and its own author
> forgets, or a different real client updates `tools.db` directly,
> bypassing `ToolRepository` entirely?
>
> The Header, above, quotes sqlite.org's own real, fetched documentation
> describing a trigger as something "automatically performed when a
> specified database event occurs." If that's literally true — does a
> real trigger ever need C# code to call it by name, the way every other
> real method in this project has needed so far?

### Project Change

- **Reference Source** — no reference counterpart consulted this
  session; per this project's own self-containment rule.
- **Files affected** — `tools.db`'s own real, live schema, modified (a
  new column, backfilled once, plus a new trigger — applied directly
  this session, the same real one-time-schema-change pattern already
  used for this project's own real index and real view).
  `ToolDB.Tests/ToolRepositoryTests.cs`, modified (`CreateTestDatabase`
  gains the identical real column and trigger; one new real test).
- **Change type** — add.
- **Location** — `tools.db`'s own real schema; `CreateTestDatabase`,
  already established.
- **Dependencies** — none beyond this project's own existing real
  `tools` table.

### The New Code

```sql
ALTER TABLE tools ADD COLUMN last_modified TEXT;
UPDATE tools SET last_modified = CURRENT_TIMESTAMP;
```

The real trigger itself, added right after:

```sql
CREATE TRIGGER trg_tools_last_modified
AFTER UPDATE ON tools
BEGIN
    UPDATE tools SET last_modified = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
```

### The Updated Project

Applied directly to the real, live `tools.db` this session
(`verification/lesson-22/step3-apply-real-trigger.cs`):

```
Real last_modified column + backfill + trigger applied to the real tools.db.
--- sqlite_schema, confirming the real trigger now exists permanently ---
trigger | trg_tools_last_modified | tools
--- real tools row, with its own real backfilled last_modified ---
1, 1/2 in 4-Flute Carbide End Mill, 2026-08-26 23:39:08
```

`tools.db`'s own real, live schema now has a fourth real schema object
kind, alongside its real tables, real index, and real view: a real
`trigger`. `ToolRepositoryTests.cs`'s own `CreateTestDatabase`, in full,
new lines marked:

```csharp
 1  private static SqliteConnection CreateTestDatabase(string path)
 2  {
 3      if (File.Exists(path))
 4      {
 5          File.Delete(path);
 6      }
 7
 8      var connection = new SqliteConnection($"Data Source={path}");
 9      connection.Open();
10
11      new SqliteCommand("CREATE TABLE vendors (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE)", connection).ExecuteNonQuery();
12      new SqliteCommand("INSERT INTO vendors (name) VALUES ('Test Tooling Co.')", connection).ExecuteNonQuery();
13      new SqliteCommand(
14          "CREATE TABLE tools (id INTEGER PRIMARY KEY, name TEXT NOT NULL, vendor_id INTEGER REFERENCES vendors(id), " +
15          "overall_diameter REAL NOT NULL CHECK (overall_diameter > 0), overall_length REAL NOT NULL CHECK (overall_length > 0), " +
16          "flute_count INTEGER NOT NULL CHECK (flute_count > 0), last_modified TEXT)", connection).ExecuteNonQuery();                          // ← changed
17      new SqliteCommand("INSERT INTO tools (name, vendor_id, overall_diameter, overall_length, flute_count, last_modified) VALUES ('Test End Mill', 1, 0.5, 3.0, 4, '2020-01-01')", connection).ExecuteNonQuery();  // ← changed
18      new SqliteCommand(
19          "CREATE VIEW tool_details AS SELECT tools.id, tools.name, vendors.name AS manufacturer, tools.overall_diameter, tools.overall_length, tools.flute_count FROM tools JOIN vendors ON tools.vendor_id = vendors.id",
20          connection).ExecuteNonQuery();
21      new SqliteCommand(@"                                                                                                                     // ← new
22          CREATE TRIGGER trg_tools_last_modified                                                                                                // ← new
23          AFTER UPDATE ON tools                                                                                                                 // ← new
24          BEGIN                                                                                                                                  // ← new
25              UPDATE tools SET last_modified = CURRENT_TIMESTAMP WHERE id = NEW.id;                                                              // ← new
26          END", connection).ExecuteNonQuery();                                                                                                  // ← new
27
28      return connection;
29  }
```

`CreateTestDatabase` (lines 1–29) now builds a real, disposable database
that matches the real, live `tools.db`'s own current shape even more
closely than before — its own seeded row (line 17) deliberately starts
with an obviously old real `last_modified` value, `'2020-01-01'`, so a
real test can prove the trigger changed it without needing to predict or
match SQLite's own real timestamp format exactly.

A new, real, permanent test proves the trigger fires through
`ToolRepository`'s own existing real code, not just raw SQL:

```csharp
[Fact]
public void UpdateFluteCount_AlsoUpdatesLastModified_ViaTrigger()
{
    using var connection = CreateTestDatabase("test_trigger_fires.db");

    using (var transaction = connection.BeginTransaction())
    {
        ToolRepository.UpdateFluteCount(connection, transaction, 1, 6);
        transaction.Commit();
    }

    using var selectCommand = new SqliteCommand("SELECT last_modified FROM tools WHERE id = 1", connection);
    var lastModified = (string)selectCommand.ExecuteScalar()!;

    Assert.NotEqual("2020-01-01", lastModified);
}
```

### Proving It in Isolation

A minimal, unrelated throwaway table, isolating exactly this real
mechanism before this project's own real trigger meets real project
code:

```csharp
new SqliteCommand("CREATE TABLE widgets (id INTEGER PRIMARY KEY, name TEXT NOT NULL)", connection).ExecuteNonQuery();
new SqliteCommand("INSERT INTO widgets (name) VALUES ('Widget A')", connection).ExecuteNonQuery();
new SqliteCommand("ALTER TABLE widgets ADD COLUMN last_modified TEXT", connection).ExecuteNonQuery();
new SqliteCommand("UPDATE widgets SET last_modified = CURRENT_TIMESTAMP", connection).ExecuteNonQuery();
```

The identical real trigger shape, then a real `UPDATE` that never
mentions `last_modified` at all, deliberately spaced out past
`CURRENT_TIMESTAMP`'s own real one-second resolution so any real change
is visible, not just inferred:

```sql
CREATE TRIGGER trg_widgets_last_modified
AFTER UPDATE ON widgets
BEGIN
    UPDATE widgets SET last_modified = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

UPDATE widgets SET name = 'Widget A Renamed' WHERE id = 1;
```

Run for real this session:

```
--- after ALTER TABLE ADD COLUMN + backfill, existing row's own real last_modified ---
1, Widget A, 2026-08-26 23:37:16
--- PRAGMA recursive_triggers (never set this session) = 0 ---
--- real UPDATE (changing only name), then real last_modified after ---
1, Widget A Renamed, 2026-08-26 23:37:17
--- total_changes() so far (expected 4: insert, backfill, real update, trigger update) = 4 ---
```

This real, captured output proves the Socratic question's own second
half directly: nothing in the real `UPDATE widgets SET name = ...`
statement mentions `last_modified` at all, yet its own real value
genuinely changed, from `23:37:16` to `23:37:17` — a full real second
later, past `CURRENT_TIMESTAMP`'s own resolution, so this is a real,
observed change, not a coincidence of timing. This is called a
**trigger**: real, automatic database logic that runs on its own,
attached to an event rather than called by name.

### Discard the Throwaway Example

The throwaway `widgets` table and its own trigger are discarded now —
neither appears in this project again. What's proven is the real,
general fact that a trigger fires with no C# code ever calling it, and
that `NEW.id` correctly identifies which real row to update — not this
specific throwaway name.

### Mechanical Walkthrough

- `ALTER TABLE tools ADD COLUMN last_modified TEXT;` — `ALTER TABLE`
  (established when this project first added a foreign-key column),
  reappearing — adds a real, nullable column with no real default value,
  since SQLite genuinely refuses a non-constant one (`CURRENT_TIMESTAMP`
  isn't constant) — a real, verified limitation this session confirmed
  directly, not assumed.
- `UPDATE tools SET last_modified = CURRENT_TIMESTAMP;` — a real,
  one-time backfill `UPDATE` (established when this project first
  needed to populate a newly-added column), reappearing — every existing
  real row gets a real, current timestamp exactly once, so no real row
  is ever left with a genuinely empty `last_modified`.
- `CREATE TRIGGER trg_tools_last_modified` — `CREATE TRIGGER` (Header,
  above) — assigns a real, permanent name to the logic that follows;
  this real name never appears anywhere in this project's own C# code,
  proving the Socratic question's own prediction that a trigger needs no
  caller.
- `AFTER UPDATE ON tools` — `AFTER` (Header, above) — this real trigger's
  own body runs only once the real `UPDATE` that fired it has already
  genuinely completed, on the real `tools` table specifically, not
  `vendors` or any other real table.
- `UPDATE tools SET last_modified = CURRENT_TIMESTAMP WHERE id = NEW.id;`
  — a second, real `UPDATE`, this one living entirely inside the
  trigger's own body — `NEW.id` (Header, above) reads the just-written
  real row's own new `id` value, ensuring this real stamp lands on
  exactly the one real row that was actually just changed, never every
  row in the table.

### CS Lens

A trigger runs in direct response to a real database event, never
because some real caller invoked it by name — a real instance of
**event-driven programming**: code structured around reacting to
something happening, rather than around an explicit real call chain.
This project's own real `AboutButton_Click`/`Browser_WebMessageReceived`
handlers already work this exact same real way at the C# layer; this
lesson brings the identical real idea one level down, into SQL itself.
Also recognized in: a spreadsheet cell that recalculates the moment a
real cell it depends on changes, with no explicit real "recalculate now"
call anywhere; a real smoke detector reacting the instant real smoke is
present, rather than being polled on a schedule; a real game engine's
own collision callback, firing only when two real objects actually
overlap.

### SE Lens

Why put this logic in the real database, as a trigger, rather than as a
real, explicit C# assignment inside `UpdateFluteCount` and `UpdateTool`?
The real alternative not chosen — setting `last_modified` directly in
each of those two real methods — was rejected because it only protects
real writes that happen to go through `ToolRepository` specifically; any
future real write path that doesn't (a raw SQL script, a completely
different real client of `tools.db`) would silently skip it. A real
trigger, by contrast, is guaranteed by SQLite itself to fire for *any*
real `UPDATE` on `tools`, regardless of which real client issued it. The
honest cost: this real logic is now genuinely invisible to a reader of
`ToolRepository.cs` alone — the same real discoverability cost already
true of this project's own real database view, now paid a second time,
for a second real reason, by a second kind of real schema object neither
appears anywhere in this project's own C# source.

### Run It

A real `dotnet build` was run this session: build succeeded, 0 new
Warnings, 0 Errors. The real, permanent trigger was applied directly to
the real, live `tools.db` this session; source and real captured output
saved in `verification/lesson-22/step3-apply-real-trigger.cs`. The
throwaway `widgets` isolation was run for real this session; source and
real captured output saved in
`verification/lesson-22/lab1-trigger-isolated.cs`. The new
`UpdateFluteCount_AlsoUpdatesLastModified_ViaTrigger` test passes for
real — the full real suite, including the next unit's own second new
test, was run together in one pass, per this project's own batched
verification convention; its own real, combined count is reported at the
end of the next unit instead of re-run separately here.

### Connecting Back

`tools.db` now stamps its own real change history automatically, and
this unit's own real, isolated proof already showed the trigger's own
internal `UPDATE` didn't grow `total_changes()` without bound. The next
unit asks the real, harder question that number quietly already
answered: could this same trigger have looped forever instead?

---

## Concept Unit: Side Effects & Recursion — What a Trigger Can (and Can't) Safely Do

### The Problem

The real trigger this project just added does something that should feel
at least a little alarming on first read: its own body performs another
real `UPDATE` on `tools` — the exact same real table whose own `UPDATE`
fired it in the first place. Does that cause the trigger to fire itself
again? And again?

> **Try this first:** if SQLite's own real trigger mechanism let a
> trigger's own write re-fire itself completely unconditionally, what
> would happen the very first real time any code called
> `ToolRepository.UpdateFluteCount`?
>
> The Header's own real, quoted `recursive_triggers` documentation says
> real support for trigger recursion exists but was "initially turned
> OFF by default, for compatibility." Given that, what real, concrete
> evidence — using only tools this project already has, not just trust
> in the documentation's own word — would actually prove whether this
> project's own real trigger recurses or not?

### Project Change

- **Reference Source** — no reference counterpart consulted this
  session; per this project's own self-containment rule.
- **Files affected** — none beyond the previous unit's own real,
  already-applied changes. This unit adds one further real, permanent
  test to `ToolDB.Tests/ToolRepositoryTests.cs`; its own recursion
  demonstration runs only against a disposable, throwaway database,
  never the real, live `tools.db`.
- **Change type** — add (one new real test).
- **Location** — `ToolRepositoryTests.cs`, immediately after the
  previous unit's own new test.
- **Dependencies** — `trg_tools_last_modified` (previous unit).

### The New Code

```sql
PRAGMA recursive_triggers = ON;
```

A deliberately dangerous real contrast, run only against a disposable
throwaway copy — never the real, live `tools.db`:

```csharp
[Fact]
public void UpdateFluteCount_RollbackAlsoUndoesTheTriggersOwnLastModifiedChange()
{
    using var connection = CreateTestDatabase("test_trigger_rollback.db");

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

    using var selectCommand = new SqliteCommand("SELECT last_modified FROM tools WHERE id = 1", connection);
    var lastModified = (string)selectCommand.ExecuteScalar()!;

    Assert.Equal("2020-01-01", lastModified);
}
```

### The Updated Project

`ToolRepositoryTests.cs`'s own test list, with this unit's own new test
added directly after the previous unit's:

```csharp
1  [Fact]
2  public void UpdateFluteCount_AlsoUpdatesLastModified_ViaTrigger() { /* previous unit */ }
3
4  [Fact]                                                                                              // ← new
5  public void UpdateFluteCount_RollbackAlsoUndoesTheTriggersOwnLastModifiedChange()                    // ← new
6  {                                                                                                    // ← new
7      using var connection = CreateTestDatabase("test_trigger_rollback.db");                           // ← new
8                                                                                                        // ← new
9      using (var transaction = connection.BeginTransaction())                                          // ← new
10     {                                                                                                 // ← new
11         ToolRepository.UpdateFluteCount(connection, transaction, 1, 99);                              // ← new
12                                                                                                        // ← new
13         using var badCommand = new SqliteCommand(                                                     // ← new
14             "UPDATE tools SET nonexistent_column = 1 WHERE id = 1",                                   // ← new
15             connection,                                                                               // ← new
16             transaction);                                                                             // ← new
17                                                                                                        // ← new
18         Assert.Throws<SqliteException>(() => badCommand.ExecuteNonQuery());                           // ← new
19         transaction.Rollback();                                                                       // ← new
20     }                                                                                                  // ← new
21                                                                                                        // ← new
22     using var selectCommand = new SqliteCommand("SELECT last_modified FROM tools WHERE id = 1", connection);  // ← new
23     var lastModified = (string)selectCommand.ExecuteScalar()!;                                        // ← new
24                                                                                                        // ← new
25     Assert.Equal("2020-01-01", lastModified);                                                         // ← new
26 }                                                                                                      // ← new
```

This new test (lines 4–26) deliberately reuses Updating and Deleting
Safely's own established rollback shape — a real, later statement in the
same real transaction fails on purpose, forcing a real `Rollback()` —
but now checks `last_modified` instead of `flute_count`, asking a real
question that unit never needed to ask: does rolling back also undo the
*trigger's own* real side effect, not just the original real statement's
own?

Real, captured proof that a real trigger's own recursion is genuinely
blocked by default, run against a disposable throwaway copy
(`verification/lesson-22/lab2-recursive-triggers-on.cs`), by
deliberately turning the real safety off:

```
--- with PRAGMA recursive_triggers = ON, attempting the same real UPDATE ---
SqliteException: SQLite Error 1: 'too many levels of trigger recursion'.
```

### Proving It in Isolation

The previous unit's own real isolated proof already contains this unit's
first real answer, unnoticed until now: its own final line reported
`total_changes()` as exactly `4` — one real `INSERT`, one real backfill
`UPDATE`, one real test `UPDATE`, and exactly one real trigger-internal
`UPDATE`. Had the trigger recursed even a single additional real time,
that real number would have been `5`, not `4` — direct, real,
already-executed evidence the trigger fired exactly once, deliberately
left unexplained in that unit so this one could ask *why* directly.

A second, separate throwaway proof, this time deliberately turning the
real safety off to show what it protects against — the exact real
`widgets`/trigger shape from the previous unit, rebuilt with one real
change:

```csharp
new SqliteCommand("PRAGMA recursive_triggers = ON", connection).ExecuteNonQuery();
```

Run for real this session, with the identical real `UPDATE` the previous
unit already ran safely:

```
--- with PRAGMA recursive_triggers = ON, attempting the same real UPDATE ---
SqliteException: SQLite Error 1: 'too many levels of trigger recursion'.
```

This real, captured output proves the Socratic question's own worry was
entirely justified *without* the real, current default: turning
`recursive_triggers` on lets the trigger's own internal `UPDATE` re-fire
itself, over and over, until SQLite's own real, internal recursion limit
stops it with a genuine error — not a silent success, and not an
infinite hang, but a real, hard failure. This is called a **recursive
trigger** (Header, above): the real, dangerous case this project's own
trigger never actually hits, only because `recursive_triggers`'s own
real default is `OFF`.

### Discard the Throwaway Example

The second throwaway `widgets` copy above, and its own deliberately
dangerous `PRAGMA recursive_triggers = ON` setting, are discarded now —
neither appears in this project again, and `recursive_triggers` is never
turned on anywhere in this project's own real code. What's proven is the
real, exact failure mode the current, real default protects against —
not this specific throwaway reproduction of it.

### Mechanical Walkthrough

- `PRAGMA recursive_triggers = ON;` — a real `PRAGMA` statement
  (established when this project first needed to inspect/set a real
  SQLite engine setting), reappearing — explicitly overrides the real,
  documented default (Header, above) so this unit's own throwaway proof
  can deliberately observe the real, dangerous behavior the default
  normally prevents.
- `ToolRepository.UpdateFluteCount(connection, transaction, 1, 99);` —
  reappearing, unchanged — this real call is what actually fires
  `trg_tools_last_modified` for real, inside the same real, still-open
  transaction this test is about to roll back.
- `Assert.Throws<SqliteException>(...)` — reappearing, unchanged —
  confirms the deliberately invalid second real statement genuinely
  fails, the same real precondition Updating and Deleting Safely's own
  rollback test already established.
- `transaction.Rollback();` — reappearing, unchanged — undoes every real
  change made inside this real transaction.
- `Assert.Equal("2020-01-01", lastModified);` — `Assert.Equal`
  (established at this project's own first automated test), reappearing
  — this unit's own real point: if the rollback had only undone the
  *original* real `UPDATE` and left the *trigger's* own real `UPDATE`
  standing, `last_modified` would show a real, recent timestamp instead
  of the real, seeded `'2020-01-01'` — proving instead that it doesn't,
  a real side effect (Header, above) genuinely lives inside the same
  real transaction as the change that caused it.

### CS Lens

A trigger's own automatic write is a real **side effect** (Header,
above): an operation's own real, observable change beyond whatever its
caller explicitly asked for. Also recognized in: this project's own
already-established `ViewModel` property setters, which raise a real
`PropertyChanged` event as a real side effect of simply assigning a
value, never something the caller directly requests; a Python list's own
real `.append()` method, which mutates its own real list in place and
returns nothing, rather than handing back a new one; a vending machine's
own real coin-return mechanism, quietly recalibrating its own internal
counters as a genuine side effect of a completely unrelated real
purchase.

### SE Lens

Should this trigger have guarded itself against its own recursion
directly — a real `WHEN` clause, skipping the trigger's own body when
only `last_modified` itself just changed — rather than depending entirely
on `recursive_triggers`'s own real, global default staying `OFF`? The
real alternative not chosen — adding that real guard now — was set aside
because it isn't needed *today*: this project's own real trigger, exactly
as written, is already provably safe under the real, current default,
proven directly this unit. The honest cost of leaving it out: this
lesson's own real, deliberate demonstration already proved that if any
future real feature in this project ever needed `recursive_triggers`
turned `ON` globally, for a completely unrelated real reason, this exact
trigger would immediately start throwing the real
`'too many levels of trigger recursion'` error shown above — a real,
latent fragility this lesson chooses to document honestly now, rather
than let a future session rediscover it by surprise.

### Run It

A real `dotnet build` was run this session: build succeeded, 0 new
Warnings, 0 Errors. The throwaway `recursive_triggers = ON` proof was run
for real this session; source and real captured output saved in
`verification/lesson-22/lab2-recursive-triggers-on.cs`. The new
`UpdateFluteCount_RollbackAlsoUndoesTheTriggersOwnLastModifiedChange`
test passes for real, alongside every test already established: **22
tests, 0 failures** — the real, current, full count for this project.

### Connecting Back

The exact same real trigger this lesson's first unit proved fires
automatically is now proven, in this unit, to fire exactly once — never
recursively — and to genuinely participate in whatever real transaction
its own triggering statement runs inside, rollback included.

---

## Connect the Pieces

One real tool — id `1`, `1/2 in 4-Flute Carbide End Mill` — traced
through both units:

1. Its own real row gained a new, real `last_modified` column, backfilled
   once for real, then a new, real, permanent trigger began stamping it
   automatically on every future real `UPDATE` — proven, through a real,
   isolated throwaway table first, that no C# code anywhere needs to call
   it by name for it to fire (Unit 1).
2. Calling the real, already-established `ToolRepository.UpdateFluteCount`
   against this exact real tool fires that trigger for real, proven by a
   real, permanent test; a second real test then forced a real rollback
   of that same real change and proved the trigger's own real side
   effect rolled back too — and a deliberately dangerous real throwaway
   experiment proved exactly what would have gone wrong if SQLite's own
   real `recursive_triggers` default had ever been anything other than
   `OFF` (Unit 2).

**Slice 4 continues.** **Next lesson:** 23 — JSON Functions in SQLite.
