# Lesson 3: Never Let Data Become Code
### (Inserting Safely)

**What you will build.** By the end of this lesson, `tools.db` — left by Lesson 2
with a real six-column `tools` table and exactly zero rows — gains its first
genuine row, inserted through a method proven safe even when the value being
inserted is actively hostile. Along the way, this lesson takes the "SQL as
data" idea Lesson 2's own CS Lens named — a SQL statement is just a string,
nothing about C#'s own syntax "knows" what it means — and pushes it to its
logical, dangerous conclusion: if a statement's text is assembled by directly
splicing a variable's value into it, then whoever controls that variable's
value controls part of the statement itself. This lesson proves that for
real, deliberately, by making an ordinary-looking string delete an entire
table using nothing but ordinary C# string interpolation. The fix — SQL
**parameters**, bound through `SqliteParameter` — isn't a defensive trick
bolted on afterward; it's a structurally different way of handing a value to
SQLite, one where a value can never be mistaken for part of the statement's
own syntax, no matter what characters it contains.

**What you need to know first.** Lesson 1 — `SqliteConnection`, `.Open()`,
`using` declarations, connection state, string interpolation, and static
typing/`CS0029` from the C# side. Lesson 2 — `SqliteCommand`,
`ExecuteNonQuery()`'s return value for a DDL statement (`0`), `ExecuteScalar()`
returning "the first column of the first row, or `null`," `sqlite_schema` as
this curriculum's own proof mechanism, type affinity, and `PRIMARY KEY`/
`rowid`. This lesson reuses the exact same open `connection` and the exact
same `tools` table Lesson 2 built — it never runs `CREATE TABLE` again.

**Terms used in this lesson**

- **DML (Data Manipulation Language)** — the subset of SQL statements that
  read or change the *data* held inside a table's already-defined structure —
  `INSERT`, and, starting Lesson 14, `UPDATE`/`DELETE` — as distinct from
  **DDL** (Lesson 2's own term), which defines or changes that structure
  itself. Lesson 2 named this category by name, in passing, without ever
  running one; this lesson's first unit is the first DML statement this
  curriculum actually executes.
- **`INSERT`** — the SQL statement that adds one new row to an existing
  table, supplying a value for some or all of its columns. It exists as
  DML's direct counterpart to Lesson 2's `CREATE TABLE`: `CREATE TABLE`
  declares, once, the shape every row in a table must fit; `INSERT` is what
  actually places a real row into that shape, as many times as an
  application needs to.
- **control plane / data plane** — in any system where instructions and the
  values those instructions operate on travel over the same channel, the
  **control plane** is whatever the receiving system ends up interpreting as
  instructions to carry out, and the **data plane** is whatever it treats as
  inert values those instructions act on. OWASP's own definition of SQL
  injection, fetched this session, names this split directly as the actual
  root cause of the vulnerability below: it happens because "SQL makes no
  real distinction between the control and data planes" — nothing about a
  byte sitting inside a SQL statement's text marks it, on its own, as "this
  part is a value" versus "this part is a command"; SQLite's own parser
  decides purely from *where* that byte sits in the overall string. This is
  the exact same "command as data" idea Lesson 2's CS Lens named, now shown
  to cut both ways.
- **SQL injection** — a real, named, current category of security
  vulnerability where a value — supplied by an attacker, or, this lesson's
  own Closing proves, even by an entirely honest user — gets spliced
  directly into a SQL statement's text, letting that value's own content
  cross from the data plane into the control plane and get interpreted as
  additional SQL syntax rather than staying one bounded value. OWASP's own
  definition, fetched this session, states it directly: "A SQL injection
  attack consists of insertion or 'injection' of a SQL query via the input
  data from the client to the application." It's a real, current, top-tier
  category of vulnerability — not a historical curiosity — precisely because
  string concatenation, this lesson's first unit's own technique, looks like
  it works correctly right up until a value crosses that plane boundary;
  this lesson's second unit proves the crossing for real, rather than only
  asserting the danger.
- **parameter (bind parameter)** — a named or numbered placeholder written
  directly into a SQL statement's own text, standing in for a value that is
  never substituted into that text at all. SQLite's own documentation,
  fetched this session, states there are five real placeholder syntaxes it
  recognizes: `?NNN`, a bare `?`, `:AAAA`, `@AAAA` (this lesson's own
  choice — "works exactly like a colon, except that the name of the
  parameter created is @AAAA"), and `$AAAA`. A parameter's actual value is
  supplied separately, *after* the statement's text has already been fully
  parsed by SQLite, and is bound to that placeholder's position as one
  single, complete value no matter what characters it contains — it exists
  specifically so a value can never be mistaken for more SQL syntax, because
  by the time it's attached to the statement, there's no more SQL syntax
  left to parse.
- **parameter binding** — the act of attaching one concrete value to one
  already-declared placeholder inside a statement whose text has already
  been fully parsed. It's the mechanism that actually enforces the
  control/data-plane separation named above: binding happens entirely on the
  *value* side of SQLite's parser, structurally after the point where
  injection would have to occur — not merely a more careful way of writing
  the same string-splicing operation, but a different operation altogether.
- **`sqlite_schema` (the schema catalog table)** — reappearing from Lesson
  2: a real, ordinary, always-queryable table every SQLite database file has
  automatically, recording the name, type, and defining SQL of every table,
  index, view, and trigger that currently exists. Lesson 2 used it to prove
  what a `CREATE TABLE` statement actually built; this lesson's second unit
  reuses the exact same table for a new purpose — proving, with a real
  before/after count, that a table this lesson's own attack targets
  genuinely stops existing.
- **`DROP TABLE`** — the DDL statement that permanently deletes a table and
  every row it holds. It's the direct destructive counterpart to Lesson 2's
  `CREATE TABLE`: where `CREATE TABLE` brings a table into existence,
  `DROP TABLE` removes it, structure and data both, with nothing left behind
  to undo it. This lesson never intends to run it against anything real —
  it's the exact statement this lesson's second unit's attack smuggles in.
- **`double`** — one of C#'s built-in numeric types: a 64-bit
  floating-point number, capable of holding a fractional value like `0.5` or
  `3.0`. It's one of several distinct numeric types C# forces a variable to
  commit to at compile time (Lesson 1's own proof of C#'s static typing);
  Python's own numbers don't surface this same distinction the same way — a
  Python `float` is already always this same kind of value, with no second,
  differently-sized alternative to choose between the way C# has (`double`
  here, versus `int`, already used in Lesson 2 for `rowsAffected`, for
  whole numbers only). `double` is used here specifically because it matches,
  in spirit, SQLite's own `REAL` storage class (Lesson 2) — both represent
  an approximate binary floating-point number, not an exact decimal.

**Objects and methods used**

- **`SqliteCommand.ExecuteNonQuery()`**
  - *What it is:* reappearing from Lesson 2 — the method that runs a
    command's SQL against the database when no rows of data are expected
    back.
  - *Implementation:* `public override int ExecuteNonQuery();`. Microsoft's
    own reference, refetched this session, states the identical
    return-value description Lesson 2 already quoted: "The number of rows
    inserted, updated, or deleted. -1 for SELECT statements." Lesson 2
    established what this returns for a DDL statement (`0` — a case that
    description doesn't actually cover). This lesson establishes two more
    real, observed cases: `1`, for a single genuine `INSERT`, matching the
    description directly for the first time this curriculum — and, in this
    lesson's second unit, a case where the number it returns stops meaning
    what it looks like it means at all.
  - *Its use:* the exact call, reused unchanged from Lesson 2, that runs
    every `INSERT` statement this lesson builds — the ones built unsafely,
    and, later, the one built safely.
- **`SqliteParameter`**
  - *What it is:* the class this lesson's fix is built around — represents
    exactly one bound value together with the name of the placeholder it
    belongs to, kept as a real, separate object rather than folded into a
    statement's own text.
  - *Implementation:* `public class SqliteParameter : System.Data.Common.DbParameter`
    (Microsoft's own public API reference, fetched this session) — inherits
    from ADO.NET's abstract `DbParameter` base class, the same family
    `SqliteConnection` (via `DbConnection`, Lesson 1) and `SqliteCommand`
    (via `DbCommand`, Lesson 2) both belong to. This lesson calls exactly
    one of its constructors, confirmed from the same reference:
    ```csharp
    public SqliteParameter(string name, object value);
    ```
  - *Its use:* built once per value this lesson's real `INSERT` needs to
    supply — five times, once for each of `tools`'s five non-`id`
    columns — each one immediately handed to `Parameters.Add(...)`, below,
    rather than ever touching the SQL text itself.
- **`SqliteCommand.Parameters`**
  - *What it is:* the property that exposes a command's own collection of
    bound parameters — the thing a `SqliteParameter`, above, actually gets
    added *to*.
  - *Implementation:* `public virtual SqliteParameterCollection Parameters { get; }`
    (Microsoft's own reference, fetched this session) — returns a
    `SqliteParameterCollection`, a real, separate class capable of holding
    more than the single parameter any one call site here happens to add
    (this lesson's own real project code adds five). Its own declared
    shape, trimmed to only the one member this lesson actually calls, is:
    ```csharp
    public class SqliteParameterCollection : System.Data.Common.DbParameterCollection
    {
        public virtual SqliteParameter Add(SqliteParameter value);
    }
    ```
    (`AddWithValue(string, object)` — real, and listed on the same
    reference page, fetched this session — is a shorthand that builds and
    adds a `SqliteParameter` in a single call instead of two; not called
    anywhere in this lesson, which builds each `SqliteParameter` explicitly
    instead, so the object this lesson is actually teaching stays visible
    at every call site rather than hidden inside a convenience method.)
  - *Its use:* reached once per command (`insertCommand.Parameters`), then
    `.Add(...)` is called on the collection it returns five times in a row,
    once per parameter this lesson's real `INSERT` needs.

**Everything else in the file, not this lesson's subject but still
explained**

- **`SqliteCommand`**
  - *What it is:* reappearing from Lesson 2 — the class representing one
    SQL statement to be run against a database.
  - *Implementation:* `public class SqliteCommand : System.Data.Common.DbCommand`,
    and the two-argument constructor this lesson reuses unchanged:
    `public SqliteCommand(string commandText, SqliteConnection connection);`
    (both confirmed from Microsoft's own reference, refetched this
    session — identical to Lesson 2's own citation).
  - *Its use:* built once per SQL statement this lesson sends, exactly as
    in Lesson 2 — the vehicle every `INSERT`, `SELECT`, and parameter this
    lesson adds travels through.
- **`SqliteConnection`**
  - *What it is:* reappearing from Lesson 1 — the class representing one
    open link to `tools.db`.
  - *Implementation:* `public class SqliteConnection : System.Data.Common.DbConnection`,
    established in Lesson 1.
  - *Its use:* the same `connection` variable Lesson 1 opened and Lesson 2
    never closed early is passed as the second argument to every
    `SqliteCommand` this lesson builds too.
- **`SqliteCommand.ExecuteScalar()`**
  - *What it is:* reappearing from Lesson 2 — runs a command's SQL and
    returns exactly one value.
  - *Implementation:* `public override object? ExecuteScalar();`.
    Microsoft's own reference, refetched this session, states the
    identical return-value description Lesson 2 already quoted: "The first
    column of the first row of the results, or null if no results."
  - *Its use:* every "did this really happen" check this lesson runs — a
    table's existence before and after an attack, a row count, a single
    stored value read back — travels through this same call, exactly as in
    Lesson 2.
- **`File.Exists(string? path)`**
  - *What it is:* reappearing from Lessons 1–2 — a `static` method on
    `System.IO.File`.
  - *Implementation:* takes a path, returns `bool`; established fully in
    Lesson 1.
  - *Its use:* reused unchanged, confirming `tools.db` is still the same
    real file on disk before this lesson does anything to it.
- **`SqliteException`**
  - *What it is:* reappearing from Lessons 1–2 — the exception type
    `Microsoft.Data.Sqlite` throws when SQLite itself reports a real error.
  - *Implementation:* established in Lesson 1, reused in Lesson 2's own
    Closing: thrown with SQLite's own native error code and message
    attached.
  - *Its use:* what this lesson's own Closing produces for real, proving
    that a value string concatenation can't safely handle doesn't just
    risk an attack — it can break on entirely ordinary, honest data too.
- **`Console.WriteLine(string?)`**
  - *What it is:* reappearing from Lesson 0 — a `static` method on
    `System.Console`.
  - *Implementation:* `public static void WriteLine(string? value)`,
    established in Lesson 0.
  - *Its use:* every observable proof this lesson produces is made visible
    through this same call, exactly as in every prior lesson.

---

## Concept Unit: Building SQL Text From a Runtime Value — `INSERT` and `ExecuteNonQuery()`'s Real Row Count

### The Problem

`tools.db` has a real six-column table (Lesson 2) and exactly zero rows.
Every SQL statement Lesson 2 ever sent was a fixed literal, typed once into
the program's own source — the exact same string, every single run. Real
tool data can't work that way: a tool's name, its manufacturer, its
dimensions, aren't known when this program is *written*, only when it's
*run*. Getting a C# variable's value into a SQL statement — turning
`string label = "...";` into part of `INSERT INTO items (label) VALUES
(...)` — is a problem Lesson 2 never had to solve, because none of its
statements ever depended on anything but their own fixed text.

### Introduce the Concept in Isolation

In `LabScratch`, a fresh scratch file, `lab4.db`:

```csharp
using Microsoft.Data.Sqlite;

if (File.Exists("lab4.db"))
{
    File.Delete("lab4.db");
}

using var connection = new SqliteConnection("Data Source=lab4.db");
connection.Open();

using var createCommand = new SqliteCommand("CREATE TABLE items (id INTEGER PRIMARY KEY, label TEXT)", connection);
createCommand.ExecuteNonQuery();

string label = "Trusted Label";
using var insertCommand = new SqliteCommand($"INSERT INTO items (label) VALUES ('{label}')", connection);
int rowsAffected = insertCommand.ExecuteNonQuery();
Console.WriteLine($"INSERT executed. ExecuteNonQuery() returned: {rowsAffected}");

using var countCommand = new SqliteCommand("SELECT COUNT(*) FROM items", connection);
object? rowCount = countCommand.ExecuteScalar();
Console.WriteLine($"Row count in items: {rowCount}");
```

Real output, captured this session:

```
INSERT executed. ExecuteNonQuery() returned: 1
Row count in items: 1
```

This proves two things directly. First, `ExecuteNonQuery()`'s return value
for a genuine `INSERT` is `1` — matching Microsoft's own documented
description word for word, "the number of rows inserted, updated, or
deleted," for the first time this curriculum: Lesson 2 only ever observed
this method against `CREATE TABLE`, a case the documentation is silent
about, and got `0`. Second, and just as important: `label`'s value —
`"Trusted Label"` — really did end up inside `items`'s one real row,
confirmed by the row count going from `0` to `1`. The technique that got it
there is C#'s own **string interpolation**, reappearing from Lesson 1, used
here for a genuinely different purpose than any prior lesson used it for:
every earlier interpolated string in this curriculum (`$"Connected. State:
{connection.State}"`, and dozens like it) built a string meant only to be
*printed* — handed straight to `Console.WriteLine` for a human to read.
This one instead builds a string meant to be *executed* — handed to
`SqliteCommand`, which sends it straight to SQLite as real SQL syntax.
Nothing about C#'s own interpolation syntax distinguishes those two
purposes; the same `$"...{...}..."` shape does both, and SQLite has no way
to tell which kind of string it's looking at once it's already text.

### Discard the Throwaway Example

`lab4.db` and every line of the lab above are discarded. Unlike every prior
throwaway lab in this curriculum, this one isn't being set aside only
because a later lesson will revisit the same idea in a more complete form —
it's being rejected outright, permanently. No future lesson in this
curriculum ever builds a SQL statement's own text by interpolating a value
into it again; the next unit is exactly why.

### Project Change

No changes to `ToolDB` from this unit. This technique isn't safe to use
for real, even briefly — this lesson's second unit proves exactly why — so
nothing from this unit lands in `Program.cs`. The real project's first
genuine `INSERT` is built directly with the safe technique this lesson's
third unit teaches.

### Mechanical Walkthrough

- `using var createCommand = new SqliteCommand("CREATE TABLE items (id INTEGER PRIMARY KEY, label TEXT)", connection);`
  — the same `SqliteCommand` constructor and `using var` declaration from
  Lesson 2, reused unchanged to build a fresh scratch table for this lab
  alone; `id INTEGER PRIMARY KEY` is the same rowid-aliasing primary key
  Lesson 2's third unit proved, `label TEXT` a single text-affinity column.
- `createCommand.ExecuteNonQuery();` — the same method call, run and
  discarded without capturing its return value this time (Lesson 2 already
  proved it's `0` for `CREATE TABLE`; this lab isn't about that fact).
- `string label = "Trusted Label";` — an ordinary variable declaration, the
  same construct as Lesson 1's `connectionString` and Lesson 2's
  `createTableSql`, given full treatment again here per the Repetition
  Rule: a `string`-typed local variable, assigned once, holding the value
  this lab's `INSERT` needs to supply.
- `using var insertCommand = new SqliteCommand($"INSERT INTO items (label) VALUES ('{label}')", connection);`
  — the same constructor and `using var` pattern reused a third time, this
  time built from an *interpolated* string rather than a fixed literal.
  `INSERT INTO items (label) VALUES ('{label}')` is this lesson's first
  new SQL syntax: `INSERT INTO tableName` names the table receiving a new
  row; the parenthesized list right after it, `(label)`, names which
  columns are being supplied a value (any column left out — here, `id` —
  gets SQLite's own default behavior for that column, which for a rowid
  alias means the next available integer, automatically); `VALUES`
  introduces the literal(s) being supplied, one per named column, in the
  same order the column list gave them. The single quotes around
  `'{label}'` are the same SQL string-literal delimiter already seen inside
  Lesson 2's own `WHERE type = 'table'` clauses — SQLite treats everything
  between two single quotes as one text literal. The interpolation hole,
  `{label}`, sits *inside* those quotes: whatever `label` holds gets
  wrapped by the quotes already sitting in the surrounding string, not
  merged with them or checked against them in any way — a fact whose exact
  danger is this lesson's very next unit.
- `int rowsAffected = insertCommand.ExecuteNonQuery();` — the method call
  from the Header above, its real, observed return value for a genuine
  `INSERT` established directly by this lab: `1`.
- `Console.WriteLine($"INSERT executed. ExecuteNonQuery() returned: {rowsAffected}");`
  — reappearing string interpolation and `Console.WriteLine`, this time
  used for its ordinary prior purpose (printing for a human), in direct
  contrast to the SQL-building interpolation two lines above.
- `using var countCommand = new SqliteCommand("SELECT COUNT(*) FROM items", connection);`
  — the same constructor again, this time carrying a `SELECT` with a new
  element: `COUNT(*)` is a SQL **aggregate function** — a function that
  summarizes many rows into a single value, rather than returning any one
  row's own column — and `COUNT(*)` specifically counts every row in the
  table named by `FROM`, regardless of what any column contains. It exists
  here as this lab's own proof mechanism: a row count that changes from `0`
  before the `INSERT` to `1` after is direct, observable evidence a row was
  really added, independent of trusting `ExecuteNonQuery()`'s own return
  value at all.
- `object? rowCount = countCommand.ExecuteScalar();` — the method call from
  the Header above, reused unchanged from Lesson 2: `COUNT(*)` always
  produces exactly one row, one column, so `ExecuteScalar()` is the right
  tool to read it back, the same reasoning Lesson 2 applied to its own
  `sqlite_schema` lookups.
- `Console.WriteLine($"Row count in items: {rowCount}");` — reappearing
  interpolation and `Console.WriteLine`, printing the real, observed count.

### CS Lens

Splitting a system's operations into ones that define *structure* and ones
that operate on *content already inside that structure* is a recurring
architectural split, not unique to SQL. Also recognized in: a filesystem's
`mkdir`/file-creation calls (structure) versus a `write()` call filling an
already-created file (content); a compiler's declaration phase (what names
exist, what shape they have) versus its later execution phase (what those
names actually hold at runtime); and Git's own object model, where a tree
object records a directory's *structure* — which names exist, and what kind
of thing each one is — entirely separately from the blob objects holding
each file's actual *content*.

### SE Lens

Why does ADO.NET make a caller build an entire SQL statement's text as a
plain string, rather than offering something like `connection.InsertRow(
"items", new { label = "Trusted Label" })` — a helper that assembles safe
SQL automatically? The alternative not chosen — a higher-level,
structured insert API — would make some things easier and, done well, safer
by construction. But `SqliteCommand` deliberately stays a thin, fully
generic wrapper around "one arbitrary chunk of SQL text" specifically so it
works identically for *any* SQL statement — this lesson's `INSERT`,
Lesson 9's multi-table `JOIN`, Lesson 20's query-planning experiments —
rather than needing a bespoke method per statement shape. The real,
honest cost of that generality: the library offers `SqliteParameter` (this
lesson's third unit) as the *safe* way to supply a value, but it never
forces its use — nothing stops a caller from doing exactly what this unit's
own lab just did instead. Lesson 24's EF Core is a real example of the
opposite tradeoff: a more restrictive, structured API that can make unsafe
SQL construction close to impossible by rarely exposing raw string
concatenation as an option at all, paid for with a whole extra abstraction
layer between the developer and the actual SQL being sent.

### Connecting Back

This lab's own technique — splice a runtime value directly into a SQL
statement's text — genuinely works: `1` row, proven twice over, once by
`ExecuteNonQuery()`'s own return value and once by an independent
`COUNT(*)`. It worked because `"Trusted Label"` was chosen by this lesson's
own author to contain nothing but ordinary letters and a space. The next
unit asks the question this one deliberately avoided: what happens when the
value contains something else?

---

## Concept Unit: SQL Injection — Proving the Danger for Real

### The Problem

The previous unit's technique looks completely reasonable, and it worked.
But `"Trusted Label"` was trusted for one specific, narrow reason: it was
chosen by this lesson's own author to contain nothing SQL assigns any
special meaning to. Real values — anything eventually typed into a WPF text
box (Lesson 17), imported from a spreadsheet, or even just an honest
manufacturer's own name — carry no such guarantee. What actually happens
when a value contains a character SQL's own syntax treats as meaningful?

### Introduce the Concept in Isolation

Back in `LabScratch`, a fresh scratch file, `lab5.db`:

```csharp
using Microsoft.Data.Sqlite;

if (File.Exists("lab5.db"))
{
    File.Delete("lab5.db");
}

using var connection = new SqliteConnection("Data Source=lab5.db");
connection.Open();

using var createCommand = new SqliteCommand("CREATE TABLE items (id INTEGER PRIMARY KEY, label TEXT)", connection);
createCommand.ExecuteNonQuery();

using var seedCommand = new SqliteCommand("INSERT INTO items (label) VALUES ('Trusted Label')", connection);
seedCommand.ExecuteNonQuery();

using var beforeCountCommand = new SqliteCommand(
    "SELECT COUNT(*) FROM sqlite_schema WHERE type = 'table' AND name = 'items'", connection);
Console.WriteLine($"'items' table exists before attack: {beforeCountCommand.ExecuteScalar()}");

string maliciousLabel = "Evil'); DROP TABLE items; --";
string insertSql = $"INSERT INTO items (label) VALUES ('{maliciousLabel}')";
Console.WriteLine($"SQL text actually sent: {insertSql}");

using var attackCommand = new SqliteCommand(insertSql, connection);
int rowsAffected = attackCommand.ExecuteNonQuery();
Console.WriteLine($"ExecuteNonQuery() returned: {rowsAffected}");

using var afterCountCommand = new SqliteCommand(
    "SELECT COUNT(*) FROM sqlite_schema WHERE type = 'table' AND name = 'items'", connection);
Console.WriteLine($"'items' table exists after attack: {afterCountCommand.ExecuteScalar()}");
```

Real output, captured this session:

```
'items' table exists before attack: 1
SQL text actually sent: INSERT INTO items (label) VALUES ('Evil'); DROP TABLE items; --')
ExecuteNonQuery() returned: 2
'items' table exists after attack: 0
```

The existence check — `SELECT COUNT(*) FROM sqlite_schema WHERE type =
'table' AND name = 'items'` — is the exact same `sqlite_schema` catalog
Lesson 2 used to prove `tools` really got created, reused here for the
opposite proof: `1` means the row naming `items` is present in the schema
catalog; `0` means it isn't — the table is genuinely, permanently gone.
Before the attack, it's `1`. After, it's `0`. Nothing here is a simulation
or a description of what *would* happen — `items` really was deleted, by a
value passed through the exact same technique the previous unit proved
works. Exactly how, and what its own printed return value actually meant,
is this unit's Mechanical Walkthrough, below.

### Discard the Throwaway Example

`lab5.db`, `lab5b.db`, `lab5c.db`, and every line of code shown or referenced
in this unit's Mechanical Walkthrough, below, are discarded. None of it
becomes part of `ToolDB`.

### Project Change

No changes to `ToolDB` from this unit either. The entire point of proving
this danger inside an isolated lab, per this curriculum's own Concept
Isolation Rule, is so it never has to be proven against the real project's
own persisted data.

### Mechanical Walkthrough

Look closely at the printed SQL text to see exactly how: `maliciousLabel`
is `"Evil'); DROP TABLE items; --"`. Once interpolated into the same
`$"INSERT INTO items (label) VALUES ('{maliciousLabel}')"` shape the
previous unit used, the *single* statement the previous unit's author
intended becomes this, read left to right:

1. `INSERT INTO items (label) VALUES ('Evil'` — a complete, valid `INSERT`
   up through `'Evil'`: the interpolation's leading quote pairs with the
   `'` inside the malicious value itself, closing the string literal three
   characters into the payload, not at the end of it — SQLite has no way
   to know this quote wasn't the one the *surrounding code* originally
   placed there.
2. `)` — closes the `VALUES (...)` list SQLite was still expecting, using
   the `)` already sitting inside the malicious value.
3. `;` — a **statement separator**: SQLite (like standard SQL generally)
   allows more than one statement in a single block of text, each one
   ended by a semicolon. This is the exact mechanism Microsoft.Data.Sqlite's
   own `SqliteCommand.PrepareAndEnumerateStatements()` — the same method
   named in Lesson 2's own Closing stack trace — exists to walk: it
   prepares and runs each `;`-separated statement it finds, one after
   another, from a single `CommandText`.
4. ` DROP TABLE items` — a second, complete SQL statement: `DROP TABLE`,
   the DDL statement from the Header above that permanently deletes a
   table and everything in it. Nothing marks this as "attacker-supplied"
   to SQLite; by the time SQLite's parser sees it, it's ordinary DDL text,
   indistinguishable from a statement this lesson's own author might have
   written on purpose.
5. `;` — ends the `DROP TABLE` statement.
6. ` --')` — SQL's own single-line **comment** marker, `--`, which makes
   SQLite ignore everything from that point to the end of the line. This
   consumes the payload's own trailing `')` — the two characters the
   *original*, intended statement still expected to find, to close its own
   string literal and `VALUES` list. Without this, the leftover `')` would
   itself be a syntax error; the comment marker is what makes the whole
   payload parse cleanly instead of merely crashing.

This is a real, working instance of **SQL injection**, from the Header
above: the value crossed from the data plane into the control plane the
moment its own `'` closed a string literal early, and everything after that
point was read as new SQL syntax, not as more of the original value.

One more thing needs proving, not just accepting: `ExecuteNonQuery()`
returned `2`. Only one row was ever inserted — does that number mean two
rows were affected? A focused follow-up, in a fresh `lab5b.db`, isolates
the question:

```csharp
using Microsoft.Data.Sqlite;

if (File.Exists("lab5b.db"))
{
    File.Delete("lab5b.db");
}

using var connection = new SqliteConnection("Data Source=lab5b.db");
connection.Open();

using var createCommand = new SqliteCommand("CREATE TABLE items (id INTEGER PRIMARY KEY, label TEXT)", connection);
Console.WriteLine($"CREATE TABLE alone returned: {createCommand.ExecuteNonQuery()}");

using var dropOnlyCommand = new SqliteCommand("DROP TABLE items", connection);
Console.WriteLine($"DROP TABLE alone returned: {dropOnlyCommand.ExecuteNonQuery()}");

using var recreateCommand = new SqliteCommand("CREATE TABLE items (id INTEGER PRIMARY KEY, label TEXT)", connection);
recreateCommand.ExecuteNonQuery();

using var insertOnlyCommand = new SqliteCommand("INSERT INTO items (label) VALUES ('x')", connection);
Console.WriteLine($"INSERT alone returned: {insertOnlyCommand.ExecuteNonQuery()}");

using var bothCommand = new SqliteCommand("INSERT INTO items (label) VALUES ('y'); DROP TABLE items;", connection);
Console.WriteLine($"INSERT ; DROP TABLE together returned: {bothCommand.ExecuteNonQuery()}");
```

Real output, captured this session:

```
CREATE TABLE alone returned: 0
DROP TABLE alone returned: 0
INSERT alone returned: 1
INSERT ; DROP TABLE together returned: 2
```

`DROP TABLE` alone returns `0`, matching `CREATE TABLE`'s own already-proven
`0` (Lesson 2) — reasonable, since neither statement inserts, updates, or
deletes any *row*. `INSERT` alone returns `1`, matching this lesson's first
unit. But the combined statement — one real `INSERT` plus one `DROP
TABLE` — returns `2`, not `1`. A second, even more targeted test, on an
entirely fresh connection that has never executed a single `INSERT`
anywhere before, rules out one possible explanation (that the driver is
somehow counting changes across the whole connection's lifetime, not just
this one call):

```csharp
using Microsoft.Data.Sqlite;

if (File.Exists("lab5c.db"))
{
    File.Delete("lab5c.db");
}

using var connection = new SqliteConnection("Data Source=lab5c.db");
connection.Open();

using var createCommand = new SqliteCommand("CREATE TABLE items (id INTEGER PRIMARY KEY, label TEXT)", connection);
createCommand.ExecuteNonQuery();

using var onlyCombinedCommand = new SqliteCommand(
    "INSERT INTO items (label) VALUES ('y'); DROP TABLE items;", connection);
Console.WriteLine($"First-ever INSERT ; DROP TABLE on a fresh connection returned: {onlyCombinedCommand.ExecuteNonQuery()}");
```

Real output, captured this session:

```
First-ever INSERT ; DROP TABLE on a fresh connection returned: 2
```

Still `2`, even though exactly one row has ever been changed, ever, on this
connection. Prose asserting a specific reason for this isn't proof — this
project's own standard requires showing the real mechanism, not describing
it confidently. `Microsoft.Data.Sqlite`'s own public source (fetched this
session, from the same repository Lesson 2's `SqliteCommand`/`SqliteParameter`
citations above come from) shows exactly what `ExecuteNonQuery()` actually
does:

```csharp
// SqliteCommand.ExecuteNonQuery()
var reader = ExecuteReader();
reader.Dispose();
return reader.RecordsAffected;
```

It doesn't compute anything itself — it delegates entirely to
`SqliteDataReader.RecordsAffected`, whose own value is built up inside
`NextResult()`, the method that steps to each `;`-separated statement in
turn:

```csharp
// SqliteDataReader.NextResult(), each time it advances to a new statement
var changes = sqlite3_changes(_command.Connection.Handle);
AddChanges(changes);

// AddChanges
private void AddChanges(int changes)
{
    if (_recordsAffected == -1)
    {
        _recordsAffected = changes;
    }
    else
    {
        _recordsAffected += changes;
    }
}
```

And SQLite's own documentation for `sqlite3_changes()`, fetched this
session, states precisely which statements are allowed to change this
number: "These functions return the number of rows modified, inserted or
deleted by the *most recently completed* INSERT, UPDATE or DELETE
statement." Critically: "Executing any other type of SQL statement does
not modify the value returned by these functions." Put together, this is
exactly what happened, statement by statement:

1. `PrepareAndEnumerateStatements()` prepares the first statement,
   `INSERT INTO items (label) VALUES ('y')` — a complete, valid `INSERT` in
   its own right.
2. `NextResult()` steps that statement, then calls `sqlite3_changes()`:
   SQLite reports `1`, a real row really was just inserted.
   `AddChanges(1)` sets `_recordsAffected` from its starting `-1` to `1`.
3. `PrepareAndEnumerateStatements()` prepares the second statement,
   `DROP TABLE items`, found immediately after the payload's own `;`.
4. `NextResult()` steps that statement too, then calls `sqlite3_changes()`
   again — but `DROP TABLE` is not an `INSERT`, `UPDATE`, or `DELETE`, so,
   per SQLite's own quoted contract above, the value it reports is left
   exactly as it was: still `1`, stale, not reset to `0` just because a
   different kind of statement ran. `AddChanges(1)` runs a second time,
   *adding* to the existing total: `1 + 1 = 2`.
5. `ExecuteNonQuery()` returns `reader.RecordsAffected`, now `2` — a number
   that looks like "two rows changed" but really means "one real row
   changed, counted twice, because dropping a table doesn't reset the
   counter this driver's own batch-accumulation logic relies on."

This is a second, independent piece of damage SQL injection causes beyond
the obvious one: it doesn't just corrupt or destroy data — it can corrupt a
program's own bookkeeping about what just happened, silently, in a way
`ExecuteNonQuery()`'s own return value gives no hint of on its own.

### CS Lens

A shared channel with no enforced boundary between "data" and
"instructions the receiver will act on" is a recurring, dangerous shape,
not unique to SQL. Also recognized in: a classic **stack buffer overflow**,
where data written past the end of a buffer overwrites the very same
stack region holding a function's own return address — control information
sitting in the same memory as ordinary data, with nothing at the hardware
level stopping one from overwriting the other; **shell/OS command
injection**, structurally identical to this lesson's own attack — Python's
own `os.system("rm " + filename)` lets a hostile `filename` containing a
space and a second command do anything a legitimate shell command could,
for exactly the same reason `INSERT`'s own text did; **format-string
vulnerabilities**, where C's `printf(userInput)` (instead of the safe
`printf("%s", userInput)`) lets attacker-supplied text dictate `printf`'s
own formatting directives; and **cross-site scripting (XSS)**, where
untrusted text gets rendered into a web page as if it were trusted HTML/JS
markup instead of inert display text. Every one of these is the same root
shape: a system that flattens "what to do" and "what value to do it with"
into one shared representation, then trusts whoever assembled that
representation to have kept the two apart correctly by convention alone.

### SE Lens

Why doesn't SQLite (or any SQL engine) just refuse to accept a value string
containing a quote, semicolon, or comment marker, closing this hole at the
source? The alternative not chosen — reject or auto-escape "dangerous"
characters inside the engine itself — sounds appealing but can't actually
work: those exact characters are completely legitimate *inside* a properly
delimited value. This lesson's own Closing proves it directly — a real
manufacturer's name containing an apostrophe is entirely ordinary data, not
an attack. By the time SQLite's parser receives a block of text, it has no
way to tell "a real apostrophe that belongs inside this value" from "one
trying to end the string early" — both look identical, because the
ambiguity was created earlier, entirely inside the C# code that built the
string, before SQLite ever saw it. That's exactly why the real fix, the
next unit, can't live inside SQLite's parser at all: it has to keep a
value out of the statement's text in the first place, not try to make
building that text "safer."

### Connecting Back

The `items` table the previous unit proved could hold a genuine row is now
gone entirely — deleted by nothing but a value, passed through the exact
same technique that unit used successfully moments earlier, plus one
follow-up proof that even the method's own return value can no longer be
trusted once its text secretly became two statements instead of one. The
next unit is the fix, and it has to work by keeping a value fully separate
from a statement's text — not by trying to make string-building more
careful.

---

## Concept Unit: SQL Parameters — `SqliteParameter`, `SqliteCommand.Parameters`, and Inserting for Real

### The Problem

The fix has to satisfy a genuinely different requirement than "escape the
dangerous characters more carefully": a value needs to reach SQLite without
SQLite's own parser ever seeing it as SQL text *at all* — not carefully
neutralized text, text that is structurally never parsed as syntax in the
first place, no matter what characters it contains.

### Introduce the Concept in Isolation

Back in `LabScratch`, a fresh scratch file, `lab6.db`, using the exact same
malicious payload the previous unit proved could delete a table:

```csharp
using Microsoft.Data.Sqlite;

if (File.Exists("lab6.db"))
{
    File.Delete("lab6.db");
}

using var connection = new SqliteConnection("Data Source=lab6.db");
connection.Open();

using var createCommand = new SqliteCommand("CREATE TABLE items (id INTEGER PRIMARY KEY, label TEXT)", connection);
createCommand.ExecuteNonQuery();

using var beforeCountCommand = new SqliteCommand(
    "SELECT COUNT(*) FROM sqlite_schema WHERE type = 'table' AND name = 'items'", connection);
Console.WriteLine($"'items' table exists before attack: {beforeCountCommand.ExecuteScalar()}");

string maliciousLabel = "Evil'); DROP TABLE items; --";

using var insertCommand = new SqliteCommand("INSERT INTO items (label) VALUES (@label)", connection);
insertCommand.Parameters.Add(new SqliteParameter("@label", maliciousLabel));
int rowsAffected = insertCommand.ExecuteNonQuery();
Console.WriteLine($"ExecuteNonQuery() returned: {rowsAffected}");

using var afterCountCommand = new SqliteCommand(
    "SELECT COUNT(*) FROM sqlite_schema WHERE type = 'table' AND name = 'items'", connection);
Console.WriteLine($"'items' table exists after attack: {afterCountCommand.ExecuteScalar()}");

using var readBackCommand = new SqliteCommand("SELECT label FROM items WHERE id = 1", connection);
Console.WriteLine($"Row 1's actual stored label: {readBackCommand.ExecuteScalar()}");
```

Real output, captured this session:

```
'items' table exists before attack: 1
ExecuteNonQuery() returned: 1
'items' table exists after attack: 1
Row 1's actual stored label: Evil'); DROP TABLE items; --
```

Every result flips relative to the previous unit's own attack, using the
identical hostile string. `ExecuteNonQuery()` returns a clean `1` — no
multi-statement accumulation quirk, because there is only ever one real
statement now; the placeholder `@label` never invites SQLite to look for a
second one. `items` still exists — `1`, before and after, unchanged. And
the read-back proves *why*: the entire malicious string — every quote,
parenthesis, semicolon, and comment marker — landed in row 1's `label`
column exactly as written, as one single, inert piece of text. Nothing
about it was neutralized, escaped, or rewritten; it simply was never
handed to SQLite's parser as anything other than a value, because parameter
binding happens *after* `"INSERT INTO items (label) VALUES (@label)"` — a
complete, valid statement all on its own, with a single placeholder where a
value belongs — has already been fully parsed. This is **parameter
binding**, from the Header above, proven directly: a value attached to an
already-parsed statement can't retroactively change what that statement's
syntax means, no matter what it contains.

### Discard the Throwaway Example

`lab6.db` and every line of the lab above are discarded; none of it becomes
part of `ToolDB`.

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule, no external application was
  searched for or read while writing this lesson.
- **Files affected** — `Program.cs`, modified.
- **Change type** — remove (Lesson 2's `CREATE TABLE` statement and both
  verification blocks it added — the `sqlite_schema` stored-SQL lookup and
  the autoindex lookup) and add (a parameterized `INSERT` and its own
  verification).
- **Location** — replacing everything from `string createTableSql = ...`
  through the closing `}` of the `if (autoindexName is null) { ... } else
  { ... }` block — Lesson 2's entire third unit's checkpoint, all of it.
  `tools.db` already has this exact schema, permanently, on disk; this
  code proved that once, and doesn't need to run, or be reverified, every
  time this program runs again — Lesson 2's own Closing already proved
  what happens if `CREATE TABLE` runs a second time against a file that
  already has the table (`SqliteException`, "table tools already exists").
- **Dependencies** — the open `connection` variable from Lesson 1, and
  `tools.db`'s already-existing six-column schema from Lesson 2.

### The New Code

```csharp
string toolName = "1/2 in 4-Flute Carbide End Mill";
string manufacturer = "O'Brien Carbide Tools";
double overallDiameter = 0.5;
double overallLength = 3.0;
int fluteCount = 4;

using var insertCommand = new SqliteCommand(
    "INSERT INTO tools (name, manufacturer, overall_diameter, overall_length, flute_count) VALUES (@name, @manufacturer, @overall_diameter, @overall_length, @flute_count)",
    connection);
insertCommand.Parameters.Add(new SqliteParameter("@name", toolName));
insertCommand.Parameters.Add(new SqliteParameter("@manufacturer", manufacturer));
insertCommand.Parameters.Add(new SqliteParameter("@overall_diameter", overallDiameter));
insertCommand.Parameters.Add(new SqliteParameter("@overall_length", overallLength));
insertCommand.Parameters.Add(new SqliteParameter("@flute_count", fluteCount));
int rowsAffected = insertCommand.ExecuteNonQuery();
Console.WriteLine($"INSERT executed. ExecuteNonQuery() returned: {rowsAffected}");

using var countCommand = new SqliteCommand("SELECT COUNT(*) FROM tools", connection);
object? toolCount = countCommand.ExecuteScalar();
Console.WriteLine($"Row count in tools: {toolCount}");

using var readBackCommand = new SqliteCommand("SELECT manufacturer FROM tools WHERE id = 1", connection);
object? storedManufacturer = readBackCommand.ExecuteScalar();
Console.WriteLine($"Row 1's stored manufacturer: {storedManufacturer}");
```

The manufacturer's own name, `"O'Brien Carbide Tools"`, is deliberately
real-looking and deliberately contains an apostrophe — not a malicious
payload this time, just an entirely ordinary value of the exact kind the
previous unit's SE Lens named: data that legitimately contains a character
SQL's own syntax also assigns meaning to.

### The Updated Project

Full `Program.cs`, new lines marked:

```csharp
using Microsoft.Data.Sqlite;

string connectionString = "Data Source=tools.db";

using var connection = new SqliteConnection(connectionString);
connection.Open();

Console.WriteLine($"Connected. State: {connection.State}");
Console.WriteLine($"Database file on disk: {File.Exists("tools.db")}");

string toolName = "1/2 in 4-Flute Carbide End Mill";                                      // ← new
string manufacturer = "O'Brien Carbide Tools";                                            // ← new
double overallDiameter = 0.5;                                                             // ← new
double overallLength = 3.0;                                                               // ← new
int fluteCount = 4;                                                                       // ← new

using var insertCommand = new SqliteCommand(                                              // ← new
    "INSERT INTO tools (name, manufacturer, overall_diameter, overall_length, flute_count) VALUES (@name, @manufacturer, @overall_diameter, @overall_length, @flute_count)", // ← new
    connection);                                                                          // ← new
insertCommand.Parameters.Add(new SqliteParameter("@name", toolName));                     // ← new
insertCommand.Parameters.Add(new SqliteParameter("@manufacturer", manufacturer));         // ← new
insertCommand.Parameters.Add(new SqliteParameter("@overall_diameter", overallDiameter));  // ← new
insertCommand.Parameters.Add(new SqliteParameter("@overall_length", overallLength));      // ← new
insertCommand.Parameters.Add(new SqliteParameter("@flute_count", fluteCount));            // ← new
int rowsAffected = insertCommand.ExecuteNonQuery();                                       // ← new
Console.WriteLine($"INSERT executed. ExecuteNonQuery() returned: {rowsAffected}");        // ← new

using var countCommand = new SqliteCommand("SELECT COUNT(*) FROM tools", connection);     // ← new
object? toolCount = countCommand.ExecuteScalar();                                         // ← new
Console.WriteLine($"Row count in tools: {toolCount}");                                    // ← new

using var readBackCommand = new SqliteCommand("SELECT manufacturer FROM tools WHERE id = 1", connection); // ← new
object? storedManufacturer = readBackCommand.ExecuteScalar();                             // ← new
Console.WriteLine($"Row 1's stored manufacturer: {storedManufacturer}");                  // ← new
```

The file no longer creates or reverifies `tools`'s schema at all — Lesson
2 already proved that once, permanently. Instead, it now does something
`tools.db` has never done before: puts a real row into the table Lesson 2
only ever left empty, using a technique already proven, in this lesson's
own third unit, to survive a value that would have destroyed a less careful
version of the same program.

### Mechanical Walkthrough

- `string toolName = "..."; string manufacturer = "..."; double
  overallDiameter = 0.5; double overallLength = 3.0; int fluteCount = 4;`
  — five ordinary variable declarations, the same construct as every prior
  lesson's `string connectionString`/`int rowsAffected`, given full
  treatment again per the Repetition Rule. Two are typed `double` — this
  lesson's own new numeric type, from the Header above, chosen because it
  matches, in spirit, the `REAL` affinity Lesson 2 gave `overall_diameter`
  and `overall_length`; one is typed `int`, reappearing from Lesson 2's own
  `rowsAffected`, matching `flute_count`'s `INTEGER` affinity the same way.
- `using var insertCommand = new SqliteCommand("INSERT INTO tools (name,
  manufacturer, overall_diameter, overall_length, flute_count) VALUES
  (@name, @manufacturer, @overall_diameter, @overall_length,
  @flute_count)", connection);` — the same constructor reused again, this
  time carrying a real `INSERT` for `tools` (the first unit's own `INSERT
  INTO ... VALUES ...` shape, reapplied to five real columns instead of
  one scratch column) with five **parameters** from the Header above —
  `@name`, `@manufacturer`, `@overall_diameter`, `@overall_length`,
  `@flute_count` — sitting exactly where five literal values would
  otherwise go. Each name matches the SQLite `@AAAA` placeholder syntax
  quoted in the Header; nothing requires a placeholder's name to match its
  column's own name, but doing so keeps the statement's own text
  self-documenting.
- `insertCommand.Parameters.Add(new SqliteParameter("@name", toolName));`
  — `new SqliteParameter("@name", toolName)` calls the constructor from
  the Header above, pairing the placeholder name `"@name"` with the real
  runtime value `toolName` currently holds; `insertCommand.Parameters`
  reaches the command's own `SqliteParameterCollection` from the Header
  above, and `.Add(...)` places the new `SqliteParameter` into it —
  the first of five.
- `insertCommand.Parameters.Add(new SqliteParameter("@manufacturer",
  manufacturer));` — the identical pattern, second parameter: pairs
  `"@manufacturer"` with `manufacturer`'s value — `"O'Brien Carbide
  Tools"`, apostrophe included — the exact value this lesson's second unit
  proved would break naive string-building, now traveling a path where
  that character carries no special meaning at all.
- `insertCommand.Parameters.Add(new SqliteParameter("@overall_diameter",
  overallDiameter));` — the identical pattern a third time, pairing
  `"@overall_diameter"` with a `double` value instead of a `string`;
  `SqliteParameter`'s constructor takes `object value`, so a `double` is
  accepted exactly as readily as a `string` was above, boxed into `object`
  the same way any value type is when passed where `object` is expected.
- `insertCommand.Parameters.Add(new SqliteParameter("@overall_length",
  overallLength));` — the same pattern, fourth parameter, another
  `double`.
- `insertCommand.Parameters.Add(new SqliteParameter("@flute_count",
  fluteCount));` — the same pattern, fifth and last parameter, this time
  pairing `"@flute_count"` with an `int` value.
- `int rowsAffected = insertCommand.ExecuteNonQuery();` — the method call
  from the Header above; this lesson's third unit already proved a single
  parameterized `INSERT` returns a clean `1`, not the multi-statement `2`
  the previous unit's attack produced.
- `Console.WriteLine($"INSERT executed. ExecuteNonQuery() returned:
  {rowsAffected}");` — reappearing interpolation and `Console.WriteLine`.
- `using var countCommand = new SqliteCommand("SELECT COUNT(*) FROM
  tools", connection);` — the `COUNT(*)` aggregate from this lesson's
  first unit, reapplied to the real `tools` table instead of the lab's
  scratch `items` table.
- `object? toolCount = countCommand.ExecuteScalar();` — the method call
  from "Everything else," above, reused unchanged.
- `Console.WriteLine($"Row count in tools: {toolCount}");` — reappearing
  interpolation and `Console.WriteLine`.
- `using var readBackCommand = new SqliteCommand("SELECT manufacturer
  FROM tools WHERE id = 1", connection);` — a `SELECT` naming one specific
  column, `manufacturer`, narrowed by `WHERE id = 1` to the one row whose
  rowid-aliased `id` (Lesson 2) equals `1` — the first row any table ever
  receives, since SQLite assigns rowid values starting from `1` by
  default.
- `object? storedManufacturer = readBackCommand.ExecuteScalar();` — the
  method call from "Everything else," above, reused unchanged, reading
  back the one value this whole unit set out to prove survives intact.
- `Console.WriteLine($"Row 1's stored manufacturer: {storedManufacturer}");`
  — reappearing interpolation and `Console.WriteLine`, printing the real,
  observed, undamaged value.

### CS Lens

Keeping a value structurally separate from the instructions that act on
it — never letting the two collapse onto one shared channel in the first
place — is the general *fix* pattern for the entire class of vulnerabilities
the previous unit's CS Lens named. Also recognized in: Python's own
`subprocess.run(["rm", filename], shell=False)`, passing arguments as a
real list instead of one shell string, closing shell injection the exact
same structural way (directly relevant to this project's own reader,
whose prior background is Python); parameterized queries in essentially
every other SQL driver (`psycopg2`'s own parameter placeholders, Java's
`PreparedStatement`); templating engines with automatic, context-aware
escaping, which keep "template structure" and "user-supplied content" on
separate channels so the two can never merge into raw, executable HTML;
and, one layer further down, the CPU-level **W^X** (write XOR execute)
memory protection, which treats "this memory page holds data" and "this
page holds executable instructions" as mutually exclusive states enforced
by the processor itself — the identical data/control separation, enforced
in hardware instead of in a SQL driver.

### SE Lens

Why does ADO.NET require a whole `SqliteParameter` object and a
`Parameters.Add(...)` call per value, rather than something like
`ExecuteNonQuery(name, manufacturer, overallDiameter, ...)` — passing
values as ordinary positional arguments? The alternative not chosen —
positional arguments — would be less code for exactly this five-value
case. But positional arguments create their own real risk: nothing stops
two arguments from silently swapping order (passing `manufacturer` where
`name` belongs) while the code still compiles and runs without error,
quietly corrupting data instead of failing loudly. A named
`SqliteParameter` collection makes the pairing explicit and
self-documenting at the point it's declared — `@manufacturer` reads
clearly next to whatever value gets bound to it — and, because it's the
exact same object every `SqliteCommand` exposes, the identical pattern
this unit just used for `INSERT` covers Lesson 14's `UPDATE`/`DELETE` and
every other parameterized statement this curriculum ever writes, without a
new API to learn each time. The honest cost accepted right now: for a
single one-off value, five separate `.Add(new SqliteParameter(...))` calls
is genuinely more code than the one-line naive version it replaces — the
same ceremony-versus-safety tradeoff Lesson 2's own SE Lens named for
`SqliteCommand` itself, paid here for the same reason.

### Commands Needed

- `dotnet build` — reappearing from Lessons 0–2: compiles without running,
  reporting warnings and errors; used here to confirm this checkpoint
  builds cleanly.
- `dotnet run` — reappearing from Lessons 0–2: builds (restoring first if
  needed) and executes, streaming output back; used here to run the real,
  final checkpoint.

### Run It — Real Output

```
dotnet build
```

Real output, captured this session, from inside `ToolDB/`:

```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

```
dotnet run
```

Real output, captured this session:

```
Connected. State: Open
Database file on disk: True
INSERT executed. ExecuteNonQuery() returned: 1
Row count in tools: 1
Row 1's stored manufacturer: O'Brien Carbide Tools
```

### Connecting Back

`tools.db` — left by Lesson 2 with a real, typed, six-column schema and
zero rows — now holds its first genuine row: a real endmill, from a
manufacturer whose own name contains the exact character this lesson's
second unit proved could destroy an entire table, stored correctly,
verbatim, specifically because that value never had to survive being
spliced into SQL text at all. What hasn't been tested yet is what happens
if the safe technique this unit just proved gets abandoned again, even
briefly, against this same real file — exactly what this lesson's Closing
does next.

---

## Closing

### Connect the Pieces

One trace, start to finish, using only what actually ran on this machine
this session. The first unit's own lab proved `INSERT`, sent as plain
interpolated text — exactly Lesson 2's own "command as data" idea, reused
for a DML statement instead of DDL for the first time — returns `1` from
`ExecuteNonQuery()` for a genuine row, matching Microsoft's own
documentation directly. The second unit took that identical technique and
supplied it a value containing a single quote, a semicolon, and a comment
marker, proving, with a real before/after count against `sqlite_schema`,
that the `items` table stopped existing entirely — and, checked against
Microsoft.Data.Sqlite's own real source and SQLite's own documented
`sqlite3_changes()` contract, that even `ExecuteNonQuery()`'s own return
value became actively misleading (`2`, not `1`) the moment the statement's
text secretly became two statements instead of one. The third unit took
the identical malicious value and supplied it through a `SqliteParameter`
instead of the statement's own text, proving the table survives, the value
lands intact and verbatim as inert text rather than a second dropped
table, and `ExecuteNonQuery()`'s return value goes back to meaning exactly
what it says. The real project checkpoint then applied that same fix for
real: `tools.db` now holds one genuine row, including a manufacturer name
with a real apostrophe in it, stored correctly for the very reason the
second unit's SE Lens gave — the value never had to survive being flattened
into SQL syntax in the first place. Change any one link — build the
`INSERT` by splicing a value into the statement's own text instead of
binding it as a parameter — and the next section proves, on this exact
file, precisely what breaks.

### What Breaks Without This

Temporarily edit `Program.cs`'s real `INSERT`, replacing the parameterized
version with the naive, interpolated version from this lesson's first
unit — keeping the exact same real values already used, apostrophe
included:

```csharp
string insertSql = $"INSERT INTO tools (name, manufacturer, overall_diameter, overall_length, flute_count) VALUES ('{toolName}', '{manufacturer}', {overallDiameter}, {overallLength}, {fluteCount})";
Console.WriteLine($"SQL text actually sent: {insertSql}");

using var insertCommand = new SqliteCommand(insertSql, connection);
int rowsAffected = insertCommand.ExecuteNonQuery();
Console.WriteLine($"INSERT executed. ExecuteNonQuery() returned: {rowsAffected}");
```

```
dotnet run
```

Real output, captured this session:

```
Connected. State: Open
Database file on disk: True
SQL text actually sent: INSERT INTO tools (name, manufacturer, overall_diameter, overall_length, flute_count) VALUES ('1/2 in 4-Flute Carbide End Mill', 'O'Brien Carbide Tools', 0.5, 3, 4)
Unhandled exception. Microsoft.Data.Sqlite.SqliteException (0x80004005): SQLite Error 1: 'near "Brien": syntax error'.
   at Microsoft.Data.Sqlite.SqliteException.ThrowExceptionForRC(Int32 rc, sqlite3 db)
   at Microsoft.Data.Sqlite.SqliteCommand.PrepareAndEnumerateStatements()+MoveNext()
   at Microsoft.Data.Sqlite.SqliteCommand.GetStatements()+MoveNext()
   at Microsoft.Data.Sqlite.SqliteDataReader.NextResult()
   at Microsoft.Data.Sqlite.SqliteCommand.ExecuteReader(CommandBehavior behavior)
   at Microsoft.Data.Sqlite.SqliteCommand.ExecuteReader()
   at Microsoft.Data.Sqlite.SqliteCommand.ExecuteNonQuery()
   at Program.<Main>$(String[] args) in .../ToolDB/Program.cs:line 21
```

No attacker is involved anywhere in this. `"O'Brien Carbide Tools"` is
exactly the same honest, real-looking value the successful checkpoint
already inserted moments earlier — the naive version breaks on entirely
ordinary data, the instant that data contains a character SQL cares about.
Reading the printed SQL text explains exactly why: the apostrophe inside
`O'Brien` closes the intended `'...'` string literal three characters in,
leaving `Brien Carbide Tools'` sitting where SQLite expects more SQL
syntax — hence `SqliteException`, reappearing from Lessons 1–2, "near
'Brien': syntax error." Because this is a syntax error, SQLite refuses to
run *any* part of the statement — nothing gets written, partially or
otherwise. Restoring `Program.cs` to its real, parameterized checkpoint and
rebuilding confirms this directly:

```
dotnet build
```

Real output, captured this session:

```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

A read-only check against `tools.db` (run from `LabScratch`, pointed at
the real file, touching nothing) confirms the row the successful checkpoint
inserted is still there, completely untouched by the failed naive attempt:

```
tools.db row count after the failed naive attempt: 1
Row 1's stored manufacturer, still intact: O'Brien Carbide Tools
```

`tools.db` is left exactly as this lesson's own successful, parameterized
checkpoint created it — one real row, undamaged — ready for Lesson 4 to
build on.

### Exercises

- This lesson's own real checkpoint bound `overall_diameter` (`0.5`) and
  `overall_length` (`3.0`) as `double` values, and `flute_count` (`4`) as
  an `int`. Using this lesson's own read-back pattern
  (`SELECT ... FROM tools WHERE id = 1`, run through `ExecuteScalar()`),
  extend it with `typeof(overall_diameter)`, `typeof(overall_length)`, and
  `typeof(flute_count)` — the same `typeof()` function Lesson 2 used to
  prove type affinity — to confirm, for yourself, that a value bound
  through a `SqliteParameter` still lands in the storage class its
  column's own declared type affinity (Lesson 2) predicts, exactly as if
  it had been a literal. Predict the three storage classes before running
  it, using Lesson 2's own affinity rules for `REAL`/`REAL`/`INTEGER`.
- Using Lesson 2's own quoted `NUMERIC`-affinity rule ("if the TEXT value
  is not a well-formed integer or real literal, then the value is stored
  as TEXT"), predict what happens if this lesson's own malicious payload —
  `"Evil'); DROP TABLE items; --"` — is bound, via `SqliteParameter`, into
  a column declared `INTEGER` instead of `TEXT`, in a scratch table. Then
  check it for real.
- Insert a second real row into `tools.db`, reusing this lesson's own
  parameterized pattern with different values for a different tool. Notice
  that the exact same `insertCommand` construction can run again,
  unmodified except for its five values — the payoff Lesson 2's own SE
  Lens named for `SqliteCommand` in the first place: a statement's shape,
  written once, reusable with different data every time.

### Definition of Done

- [ ] `ToolDB/Program.cs` builds with `dotnet build` at 0 warnings, 0
      errors.
- [ ] `dotnet run` prints all five lines: `Connected. State: Open`,
      `Database file on disk: True`, `INSERT executed. ExecuteNonQuery()
      returned: 1`, `Row count in tools: 1`, and `Row 1's stored
      manufacturer: O'Brien Carbide Tools`.
- [ ] `tools.db` contains exactly one row in `tools`, confirmed via
      `COUNT(*)` and a direct read-back, not merely assumed from the
      source code.
- [ ] The "what breaks" experiment above was actually run against the
      real, finished checkpoint's own values, the real `SqliteException`
      ("near 'Brien': syntax error") was seen, and `Program.cs` was
      restored to the parameterized version afterward — confirmed to
      still build, and confirmed, via a real read-only check, that
      `tools.db`'s one row survived untouched.
- [ ] A git commit exists containing the updated `Program.cs`, with a
      message explaining *why* (`tools` now holds a real row, inserted
      through parameter binding proven safe against a payload that
      destroys the naive alternative — not just "add INSERT").

Next lesson: **Lesson 4 — Querying Back**, reading `tools`'s own row back
out through `SELECT` and `ExecuteReader()` — and writing this project's
first automated test, so this lesson's own manual "run it, read the
output" verification stops being the only way to know this code still
works.
