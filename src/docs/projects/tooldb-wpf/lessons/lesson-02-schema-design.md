# Lesson 2: What a Schema Promises vs. What SQLite Enforces
### (Schema Design)

**What you will build.** By the end of this lesson, `tools.db` — left by Lesson 1
as an empty, 0-byte file with an open connection and nothing else — has its
first real table: `tools`, with six typed columns and a primary key, built
entirely by sending a SQL statement through C# as plain text rather than
calling a method with parameters. Every claim this lesson makes about what
got created is proven by asking SQLite's own schema catalog what it actually
stored, not by trusting what the `CREATE TABLE` statement said. Along the
way, two things this lesson's own SQL syntax visually looks like it
guarantees turn out not to work the way they appear to promise: a column's
declared type (`TEXT`, `INTEGER`, `REAL`) is a recommendation SQLite calls
**type affinity**, not an enforced rule the way a C# variable's type is — and
declaring a `PRIMARY KEY` doesn't create a new identity mechanism at all; it
wires a column up to something every ordinary SQLite table already has,
whether asked for or not. The transferable problem underneath both: reading
a schema's syntax and trusting what it visually seems to guarantee, instead
of checking what the system you're actually talking to really enforces.

**What you need to know first.** Lesson 1 — `SqliteConnection`, `.Open()`,
`using` declarations (tying `Dispose()` to the end of a scope), connection
state, `File.Exists`/`FileInfo` as external proof a claim about a file is
true, `SqliteException` as what a real SQLite failure looks like in C#, and
static typing/`var`/string interpolation from the C# side. This lesson reuses
the exact same open `connection` Lesson 1 built and never closes it early.

**Terms used in this lesson**

- **SQL (Structured Query Language)** — a **declarative** language for
  describing *what* data or structure you want, not a sequence of steps for
  *how* to produce it. This is a genuinely different shape than every line
  of C# or Python written in this curriculum so far: a C# statement like
  `connection.Open()` is an imperative instruction — do this, now, in this
  order — while a SQL statement like `CREATE TABLE tools (name)` describes a
  desired end state and leaves SQLite entirely free to decide how to achieve
  it internally. It exists because relational databases were built around
  the idea that a query optimizer, not the caller, is in the best position
  to decide the actual steps — a caller states the *what*, once, and the
  same statement can run efficiently even as the underlying data or engine
  changes.
- **DDL (Data Definition Language)** — the subset of SQL statements that
  define or change a database's own structure — `CREATE TABLE`, and (later
  lessons) `ALTER TABLE`, `DROP TABLE` — as opposed to statements that
  operate on the *data inside* that structure. It exists as a named category
  because SQL's statements split cleanly into two different jobs: DDL
  describes the shape data must fit; a separate category (**DML**, Data
  Manipulation Language — `INSERT`/`UPDATE`/`DELETE`, Lessons 3 and 14)
  changes what data fills that shape. This lesson works entirely in DDL;
  nothing here inserts, changes, or deletes a single row.
- **table** — a named, organized collection of rows that all share the exact
  same set of columns. It's the fundamental unit a relational database
  organizes data into — the "relational" in "relational database" refers
  specifically to a table being a mathematical relation: a fixed set of
  named, typed attributes, with each row one instance of that shape.
- **column** — a single named slot every row in a table has exactly one
  value for (or `NULL`, meaning "no value"). A table's columns, taken
  together, define its shape once, up front — every row that will ever
  exist in that table has to conform to it, rather than each row carrying
  its own independent set of fields the way, say, a Python dictionary could.
- **row** — one concrete record that conforms to a table's column shape.
  This lesson creates a table but never inserts a single row — that's
  Lesson 3's job — but the table's own column list, written today, is
  exactly the shape every future row will be required to fit.
- **schema** — the overall structure of a database: which tables exist, and
  what columns, types, and constraints each one declares — as distinct from
  the data actually stored inside that structure. Two databases can hold
  completely different data while sharing an identical schema, the same way
  two different C# objects can be different instances of the same class.
  This term is easy to confuse with `sqlite_schema`, the next term below —
  they are related but not the same thing: one is a general concept, the
  other is a specific, real, queryable table.
- **`sqlite_schema` (the schema catalog table)** — a real, ordinary,
  always-queryable table that every SQLite database file has automatically,
  recording the name, type, and exact defining SQL text of every table,
  index, view, and trigger that exists in that database. It exists so a
  program (or a person) can ask the database itself "what structure do you
  actually have right now" and get a real, current, authoritative answer —
  instead of a program having to separately track, and possibly get out of
  sync with, whatever `CREATE TABLE` statements it believes it already ran.
  This lesson uses it as its own proof mechanism throughout: every claim
  about what got created is checked here, not just asserted from the
  `CREATE TABLE` text alone.
- **type affinity** — SQLite's own type system for columns: a column is
  given a "recommended" storage class it nudges incoming values toward,
  rather than a strictly enforced type that rejects anything else. This is a
  real, deliberate difference from how most other relational database
  systems (PostgreSQL, SQL Server) treat a declared column type as a hard
  constraint. It exists because SQLite was designed to be dynamically typed
  at the value level from the start — every individual *value* SQLite ever
  stores already carries its own real type tag at runtime, independent of
  whatever type its column happens to be declared with; "affinity" is just
  the name for the conversion SQLite tries to apply on the way in, given
  that starting point.
- **storage class** — the actual, concrete kind a specific stored value
  really is at runtime: `NULL`, `INTEGER`, `REAL`, `TEXT`, or `BLOB`. This is
  distinct from a column's *declared type* (the word written in the
  `CREATE TABLE` statement, like `INTEGER` or `REAL`), which is just a
  name — a hint used to compute the column's affinity — not the guaranteed
  type of every value that ends up stored there.
- **`CAST` expression** — SQL syntax, `CAST(value AS type)`, that explicitly
  requests a value be converted to a specific storage class right now,
  inside a single expression, independent of any column. It exists as the
  same underlying conversion mechanism type affinity uses on values being
  stored into a column — this lesson uses `CAST` specifically because it can
  demonstrate that exact conversion behavior without needing any table,
  `INSERT`, or `SELECT` of application data at all.
- **`typeof()`** — a built-in SQL function, native to SQLite, that takes any
  single value and returns its real, current storage class as a text
  string (`"integer"`, `"real"`, `"text"`, `"blob"`, or `"null"`). It exists
  as SQLite's own way of answering "what does this database engine actually
  think this value is, right now" — the same question `object.GetType()`
  answers about a C# value, but from inside SQL text instead of C# code.
- **constraint** — a rule the database engine actively *enforces*, rejecting
  any statement that would violate it, rather than merely converting or
  nudging data toward a preferred shape. This is the direct contrast to type
  affinity, above: affinity converts a value and stores it anyway even when
  the conversion fails; a constraint refuses to store the value at all.
  `PRIMARY KEY`, below, is one specific constraint.
- **`PRIMARY KEY`** — a constraint, declared inside a `CREATE TABLE`
  statement, naming which column (or columns) must uniquely identify every
  row in that table — no two rows may ever share the same primary key
  value, and it can never be left `NULL`. It exists because a table with no
  reliable way to pick out "this exact row, and only this one" has no way
  to safely target a later update or delete at a single record instead of
  an entire group of look-alike rows.
- **`rowid`** — a hidden, always-present 64-bit integer that ordinarily
  identifies every row in every SQLite table, whether or not that table
  ever declares a primary key of its own. It exists as SQLite's own default,
  built-in row-identity mechanism — proven, this lesson, to be the same
  mechanism `INTEGER PRIMARY KEY` quietly reuses rather than replaces.
- **index** — a real, separate on-disk structure SQLite can build
  alongside a table, purpose-built to make finding rows by a specific
  value fast, or to actively enforce that a value never repeats (a
  *unique* index). This lesson only needs one specific fact about
  indexes — that SQLite sometimes creates one automatically to enforce a
  constraint, and sometimes doesn't — proven directly, below; how an index
  actually works internally, and what it does to real query performance,
  is Lesson 20's own dedicated subject.

**Objects and methods used**

- **`SqliteCommand`**
  - *What it is:* the primary class this lesson's first unit is about — a
    class in the `Microsoft.Data.Sqlite` namespace representing one SQL
    statement to be run against a database, the vehicle every piece of SQL
    text in this curriculum from here forward travels through.
  - *Implementation:* `public class SqliteCommand : System.Data.Common.DbCommand`
    — inherits from ADO.NET's abstract `DbCommand` base class, the same
    family `SqliteConnection` belongs to via `DbConnection` (confirmed from
    Microsoft's own public API reference for `SqliteCommand`, fetched this
    session). This lesson calls more than one of its members
    (`ExecuteNonQuery()` and `ExecuteScalar()`, both below), so its real
    declared shape — trimmed to only the members this lesson actually
    calls — is:
    ```csharp
    public class SqliteCommand : System.Data.Common.DbCommand
    {
        public SqliteCommand(string commandText, SqliteConnection connection);
        public override int ExecuteNonQuery();
        public override object? ExecuteScalar();
    }
    ```
    (`ExecuteReader()`, also real and listed on the same reference page, is
    not shown above — this lesson never calls it; reading many rows back is
    Lesson 4's own dedicated subject.)
  - *Its use:* built once per SQL statement throughout this lesson, using
    the two-argument constructor shown above — the statement text and the
    already-open `connection` from Lesson 1 — then run one of two ways,
    depending on whether a value is expected back.
- **`SqliteCommand.ExecuteNonQuery()`**
  - *What it is:* the method that runs a command's SQL against the database
    when no rows of data are expected back — the method this lesson's own
    `CREATE TABLE` statements are run through.
  - *Implementation:* `public override int ExecuteNonQuery();`. Microsoft's
    own reference, fetched this session, states its return value plainly:
    "The number of rows inserted, updated, or deleted. -1 for SELECT
    statements." Neither case describes a `CREATE TABLE` statement
    directly — this lesson's own isolated lab, below, establishes the real,
    observed value for that specific case instead of guessing from a
    description that doesn't cover it.
  - *Its use:* the exact call that turns this lesson's `CREATE TABLE` text
    from inert string data into a real, executed statement.
- **`SqliteCommand.ExecuteScalar()`**
  - *What it is:* the method that runs a command's SQL and returns exactly
    one value back — the smallest possible way to read something out of the
    database, used throughout this lesson to prove what actually got
    created.
  - *Implementation:* `public override object? ExecuteScalar();`. Microsoft's
    own reference, fetched this session, states exactly what it returns:
    "The first column of the first row of the results, or null if no
    results." Nothing here reads a second row or a second column even if
    the query happened to produce one — this lesson's own queries are
    written specifically so exactly one row, one column, is all that's ever
    possible.
  - *Its use:* every "did this really happen" check this lesson runs against
    `sqlite_schema` — reading back the exact SQL SQLite recorded for a
    table, or the name of an automatically created index, one value at a
    time.

**Everything else in the file, not this lesson's subject but still
explained**

- **`SqliteConnection`**
  - *What it is:* reappearing from Lesson 1 — the class representing one
    open link to `tools.db`, this lesson's own subject one lesson ago.
  - *Implementation:* `public class SqliteConnection : System.Data.Common.DbConnection`,
    confirmed from Microsoft's own public API reference for
    `SqliteConnection` in Lesson 1, fetched that session.
  - *Its use:* the `connection` variable Lesson 1 opened and never closes
    early (thanks to its own `using var` from Lesson 1's third unit) is
    passed as the second argument to every `SqliteCommand` this lesson
    builds — every SQL statement in this lesson travels over the exact same
    live link, never a new one.
- **`File.Exists(string? path)`**
  - *What it is:* reappearing from Lesson 1 — a `static` method on
    `System.IO.File`.
  - *Implementation:* takes a path, returns `bool` — `true` if a file exists
    at that path, `false` otherwise; established fully in Lesson 1.
  - *Its use:* reused inside this lesson's first isolated lab, unchanged, to
    prove a scratch file already exists (thanks to `Open()`, Lesson 1's own
    proven claim) before any table gets created inside it.
- **`FileInfo`**
  - *What it is:* reappearing from Lesson 1 — a class in `System.IO`
    wrapping one specific file path so its real properties can be inspected.
  - *Implementation:* `public sealed class FileInfo : System.IO.FileSystemInfo`;
    constructed with `FileInfo(string fileName)`; its `Length` property —
    `public long Length { get; }` — established fully in Lesson 1.
  - *Its use:* `new FileInfo("lab1.db").Length`, used in this lesson's first
    isolated lab to prove, in real bytes, that `CREATE TABLE` writes actual
    structure into a file that Lesson 1 already proved starts out empty.
- **`SqliteException`**
  - *What it is:* reappearing from Lesson 1's own Closing — the exception
    type `Microsoft.Data.Sqlite` throws when SQLite itself reports a real
    error.
  - *Implementation:* established in Lesson 1: thrown with SQLite's own
    native error code and message attached, surfaced in full in this
    lesson's own Closing.
  - *Its use:* what this lesson's own "what breaks" experiment produces for
    real, proving `CREATE TABLE` cannot silently redefine a table that
    already exists.
- **`Console.WriteLine(string?)`**
  - *What it is:* reappearing from Lesson 0 — a `static` method on
    `System.Console`.
  - *Implementation:* `public static void WriteLine(string? value)` —
    established in Lesson 0, reused throughout Lesson 1.
  - *Its use:* every observable proof this lesson produces — a returned row
    count, a piece of schema text read back, an index name or its
    absence — is made visible as real printed output through this same
    call, exactly as in both prior lessons.

---

## Concept Unit: Sending SQL as Data — `SqliteCommand`, `ExecuteNonQuery()`, and `ExecuteScalar()`

### The Problem

Lesson 1 ends with `connection` open and pointed at `tools.db`, but nothing
has ever actually been asked of it — `Open()` only proves a live link
exists, not that anything can be done over it. Every capability this
curriculum adds from here forward — creating a table, inserting a row,
reading one back — has to travel across that connection somehow, and unlike
`File.Exists(path)` or `connection.Open()`, there's no
`connection.CreateTable("tools", ...)` method with a parameter for every
possible column. SQL statements are just text, however elaborate, and
ADO.NET needs one single, generic vehicle capable of carrying any of them —
a `CREATE TABLE`, later an `INSERT`, later a `SELECT` — through the same
open connection.

### Introduce the Concept in Isolation

In a fresh throwaway `LabScratch` project, using a scratch file, `lab1.db`:

```csharp
using Microsoft.Data.Sqlite;

if (File.Exists("lab1.db"))
{
    File.Delete("lab1.db");
}

using var connection = new SqliteConnection("Data Source=lab1.db");
connection.Open();

Console.WriteLine($"File exists before CREATE TABLE: {File.Exists("lab1.db")}");
Console.WriteLine($"File size before CREATE TABLE: {new FileInfo("lab1.db").Length} bytes");

using var createTableCommand = new SqliteCommand("CREATE TABLE tools (name)", connection);
int rowsAffected = createTableCommand.ExecuteNonQuery();
Console.WriteLine($"ExecuteNonQuery() returned: {rowsAffected}");

Console.WriteLine($"File exists after CREATE TABLE: {File.Exists("lab1.db")}");
Console.WriteLine($"File size after CREATE TABLE: {new FileInfo("lab1.db").Length} bytes");
```

Real output, captured this session:

```
File exists before CREATE TABLE: True
File size before CREATE TABLE: 0 bytes
ExecuteNonQuery() returned: 0
File exists after CREATE TABLE: True
File size after CREATE TABLE: 8192 bytes
```

This proves several things at once, none of them merely assumed. The file
already exists (`True`) *before* `CREATE TABLE` ever runs — that's
`Open()`'s own doing, Lesson 1's proven claim, not something new here. Its
size, though, is `0` bytes before — exactly Lesson 1's own foreshadowed gap:
"SQLite defers writing its actual on-disk format ... until the first time
something is actually written into the file." After the `CREATE TABLE`
statement runs, the file jumps to `8192` bytes — SQLite's real on-disk page
size, genuine physical proof that real structure got written, not merely a
claim about what the statement should have done. And `ExecuteNonQuery()`
itself returned `0` — a real, observed answer to a question Microsoft's own
documentation doesn't directly cover (it describes insert/update/delete row
counts, and `-1` for `SELECT`, but says nothing about `CREATE TABLE`
specifically): sending a **Data Definition Language (DDL)** statement — a
statement that defines structure rather than manipulating rows — through
`ExecuteNonQuery()` returns `0`, because no rows were inserted, updated, or
deleted; none of that vocabulary applies to defining a table in the first
place.

Running `CREATE TABLE` and printing a return value proves *something*
happened — but does it prove `tools` now exists, by that exact name, with
that exact definition? Continue the same lab:

```csharp
using var lookupCommand = new SqliteCommand(
    "SELECT sql FROM sqlite_schema WHERE type = 'table' AND name = 'tools'",
    connection);
object? storedSql = lookupCommand.ExecuteScalar();
Console.WriteLine($"sqlite_schema's stored SQL for 'tools': {storedSql}");

using var missingLookupCommand = new SqliteCommand(
    "SELECT sql FROM sqlite_schema WHERE type = 'table' AND name = 'nonexistent'",
    connection);
object? missingResult = missingLookupCommand.ExecuteScalar();
if (missingResult is null)
{
    Console.WriteLine("sqlite_schema's stored SQL for 'nonexistent': null");
}
else
{
    Console.WriteLine($"sqlite_schema's stored SQL for 'nonexistent': {missingResult}");
}
```

Real output, captured this session:

```
sqlite_schema's stored SQL for 'tools': CREATE TABLE tools (name)
sqlite_schema's stored SQL for 'nonexistent': null
```

This is a specific, concrete answer, not a general "yes it worked": SQLite's
own real, queryable schema catalog — `sqlite_schema` — really does contain a
row recording exactly the statement this lab sent, retrievable back as
plain text through `ExecuteScalar()`. Asking about a table that was never
created returns `null` — Microsoft's own documented behavior for
`ExecuteScalar()`, "the first column of the first row of the results, or
null if no results," proven for a real, deliberately missing name rather
than only quoted from the docs. This whole two-step pattern — send a
statement with no data expected back, then separately ask the database what
it actually has — is called **sending SQL as data**: the statement itself
is inert text handed to a generic method, run only once actually passed to
`ExecuteNonQuery()`, exactly the same way any other string could be handed
to any other method — nothing about C#'s own syntax "knows" what `CREATE
TABLE` means; only SQLite, on the other side of the connection, does.

### Discard the Throwaway Example

`lab1.db` and every line of the lab above are discarded; none of it becomes
part of `ToolDB`.

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule, no external application was
  searched for or read while writing this lesson.
- **Files affected** — `Program.cs`, modified.
- **Change type** — add.
- **Location** — after the two `Console.WriteLine` calls Lesson 1 added
  (`"Connected. State: ..."` and `"Database file on disk: ..."`).
- **Dependencies** — the open `connection` variable from Lesson 1.

### The New Code

```csharp
string createTableSql = "CREATE TABLE tools (name)";
using var createTableCommand = new SqliteCommand(createTableSql, connection);
int rowsAffected = createTableCommand.ExecuteNonQuery();
Console.WriteLine($"CREATE TABLE executed. ExecuteNonQuery() returned: {rowsAffected}");

using var lookupCommand = new SqliteCommand(
    "SELECT sql FROM sqlite_schema WHERE type = 'table' AND name = 'tools'",
    connection);
object? storedSql = lookupCommand.ExecuteScalar();
Console.WriteLine($"sqlite_schema's stored SQL for 'tools': {storedSql}");
```

### The Updated Project

Full `Program.cs`, new lines marked:

```csharp
using Microsoft.Data.Sqlite;

string connectionString = "Data Source=tools.db";

using var connection = new SqliteConnection(connectionString);
connection.Open();

Console.WriteLine($"Connected. State: {connection.State}");
Console.WriteLine($"Database file on disk: {File.Exists("tools.db")}");

string createTableSql = "CREATE TABLE tools (name)";                                      // ← new
using var createTableCommand = new SqliteCommand(createTableSql, connection);             // ← new
int rowsAffected = createTableCommand.ExecuteNonQuery();                                  // ← new
Console.WriteLine($"CREATE TABLE executed. ExecuteNonQuery() returned: {rowsAffected}");  // ← new

using var lookupCommand = new SqliteCommand(                                              // ← new
    "SELECT sql FROM sqlite_schema WHERE type = 'table' AND name = 'tools'",              // ← new
    connection);                                                                           // ← new
object? storedSql = lookupCommand.ExecuteScalar();                                        // ← new
Console.WriteLine($"sqlite_schema's stored SQL for 'tools': {storedSql}");                // ← new
```

The file now does everything Lesson 1's version did, plus one genuinely new
capability: it defines real structure inside `tools.db` and immediately
proves — by asking SQLite's own catalog, not by trusting the statement it
just sent — that the structure it asked for is the structure that's really
there. The one column this checkpoint's table has, `name`, is deliberately
minimal and untyped; what a declared column type actually does — and
doesn't — guarantee is this lesson's next unit.

### Mechanical Walkthrough

- `string createTableSql = "CREATE TABLE tools (name)";` — an ordinary
  variable declaration (the same construct as Lesson 1's `connectionString`
  line, given full treatment again here per this schema's Repetition Rule)
  holding a **SQL** statement as plain text. Its content is this lesson's
  real subject: `CREATE TABLE` names the **DDL** statement being sent;
  `tools` is the new **table**'s name; `(name)` declares one **column**
  named `name` with no type written at all — legal SQL, and, per SQLite's
  own rules, not actually "typeless" so much as defaulted to a specific
  affinity; exactly what that means is this lesson's next unit's subject,
  not this one's.
- `using var createTableCommand = new SqliteCommand(createTableSql, connection);`
  — `using var` is the **using declaration** construct proven in Lesson 1's
  third unit: ties `createTableCommand`'s `Dispose()` call to the end of the
  program's scope, the same guarantee already proven for `connection` itself
  one lesson ago. `new SqliteCommand(createTableSql, connection)` calls the
  two-argument constructor from the Header above, handing it both the SQL
  text just declared and the same `connection` object Lesson 1 opened and
  never closes early — this is the first time in this curriculum a second
  object is built *around* an already-open connection rather than opening
  one itself.
- `int rowsAffected = createTableCommand.ExecuteNonQuery();` — the method
  call from the Header above; proven, in this unit's isolated lab, to
  return `0` specifically for a `CREATE TABLE` statement — a real, observed
  fact this lesson establishes because Microsoft's own documentation is
  silent on that exact case.
- `Console.WriteLine($"CREATE TABLE executed. ExecuteNonQuery() returned: {rowsAffected}");`
  — reappearing string interpolation (Lesson 1) and `Console.WriteLine`
  (Lesson 0), given full treatment again per the Repetition Rule: the
  `{rowsAffected}` slot is evaluated and substituted directly into the
  printed string.
- `using var lookupCommand = new SqliteCommand("SELECT sql FROM sqlite_schema WHERE type = 'table' AND name = 'tools'", connection);`
  — the same constructor as above, this time carrying a different kind of
  SQL statement: a **`SELECT`**, SQL's statement for asking a question
  rather than defining or changing anything. Enough of its shape is needed
  to follow this exact line, even though the *general* `SELECT`
  statement — many columns, many rows, richer conditions — is Lesson 4's own
  dedicated subject: `SELECT sql` asks for the value of the `sql` column;
  `FROM sqlite_schema` names the table being asked (the schema catalog from
  the Header above); `WHERE type = 'table' AND name = 'tools'` narrows the
  request to only the one row (if any) whose `type` column reads `'table'`
  and whose `name` column reads `'tools'` — both conditions joined by `AND`,
  meaning both must be true at once for a row to match.
- `object? storedSql = lookupCommand.ExecuteScalar();` — `object?` is the
  same nullable-reference syntax Lesson 1's `SqliteConnection?` used in its
  third unit's `crash.db` lab: the trailing `?` marks that this variable is
  allowed to hold `null`, which matters here specifically because
  `ExecuteScalar()`'s own documented return type, per the Header above, is
  itself `object?` — a query that matches no rows really can, and here
  sometimes does, return nothing at all. `.ExecuteScalar()` is the method
  call from the Header above.
- `Console.WriteLine($"sqlite_schema's stored SQL for 'tools': {storedSql}");`
  — reappearing interpolation and `Console.WriteLine`, printing whatever
  `sqlite_schema` genuinely reports back — the real proof mechanism this
  entire lesson leans on from here forward.

### CS Lens

Handing a statement to a system as a plain string, to be interpreted and
carried out by that system rather than invoked as a direct function call, is
a real, recurring idea worth naming on its own: **command as data**, rather
than command as a direct call. Also recognized in: the Command design
pattern (a request reified as an object instead of an immediate method
call, so it can be queued, logged, or undone); any remote-procedure-call
(RPC) system, where a request is serialized into a message before it's
ever executed anywhere; regular-expression engines, which take a pattern as
a string and compile/interpret it separately from the code that wrote it;
and — foreshadowing Lesson 3's actual subject directly — SQL injection
itself, which is precisely what goes wrong when a program blurs the line
between "data I'm handing to the interpreter" and "code the interpreter
should execute" by building that data carelessly.

### SE Lens

Why does ADO.NET require building a whole `SqliteCommand` object instead of
offering something simpler, like `connection.ExecuteNonQuery(sql)` directly?
The alternative not chosen — a single flat method call — would be less
ceremony for exactly what this unit does: one statement, run once, nothing
else attached. But a command object exists because a real SQL statement
usually needs to carry more than just its own text: parameters bound to
placeholders (Lesson 3), a transaction it should run inside (Lesson 14), a
timeout. Bundling all of that into a single object — rather than scattering
it across a long parameter list on a flat method — is also what makes
`SqliteCommand`'s `Prepare()` method possible (real, and listed on the same
Microsoft reference page fetched this session, though not called anywhere
in this lesson): SQLite can compile a statement's text once and reuse that
compiled form across many executions with different parameter values,
something a `connection.ExecuteNonQuery(sql)`-style flat call, re-parsing a
brand-new string every time, has no natural place to attach to. The real
cost accepted right now: for this lesson's one-shot `CREATE TABLE`, a full
command object is genuine ceremony for something that could have been a
single line — a cost that starts paying for itself the moment Lesson 3
needs to run the same statement shape many times with different values.

### Commands Needed

- `dotnet build` — reappearing from Lessons 0–1: compiles without running,
  reporting warnings and errors; used here to confirm this checkpoint builds
  cleanly.
- `dotnet run` — reappearing from Lessons 0–1: builds (restoring first if
  needed) and executes, streaming output back; used here to run this unit's
  lab and, afterward, the real checkpoint.

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
CREATE TABLE executed. ExecuteNonQuery() returned: 0
sqlite_schema's stored SQL for 'tools': CREATE TABLE tools (name)
```

### Connecting Back

`tools.db` — still the exact same file Lesson 1 opened and left at 0
bytes — has just gained its first real content, proven twice over: its own
growth in bytes (this unit's isolated lab) and, now, its own schema
catalog's word for it (the real project checkpoint above). The one column
it has right now, though, was written with no declared type at all — the
next unit is what a declared type actually buys, and doesn't buy.

---

## Concept Unit: Columns and Type Affinity — Declared Types as Suggestions

### The Problem

The `tools` table the previous unit created has exactly one column, `name`,
with no declared type — legal SQL, but not a usable schema for real tool
data: a diameter needs to behave like a number; a flute count needs to
behave like a whole number. Naming a type for each column —
`TEXT`, `REAL`, `INTEGER` — looks, on the surface, exactly like declaring a
C# variable's type: fixed, checked, refused if violated. Lesson 1 already
proved C#'s own version of that promise for real — reassigning a
`string`-typed variable to `5` failed to even compile, `CS0029`, whether
declared explicitly or with `var`. Does declaring a SQLite column `INTEGER`
make the same promise?

### Introduce the Concept in Isolation

Back in `LabScratch`, a fresh scratch file, `lab2.db`:

```csharp
using Microsoft.Data.Sqlite;

if (File.Exists("lab2.db"))
{
    File.Delete("lab2.db");
}

using var connection = new SqliteConnection("Data Source=lab2.db");
connection.Open();

using var literalIntCommand = new SqliteCommand("SELECT typeof(5)", connection);
Console.WriteLine($"typeof(5) = {literalIntCommand.ExecuteScalar()}");

using var literalTextCommand = new SqliteCommand("SELECT typeof('5')", connection);
Console.WriteLine($"typeof('5') = {literalTextCommand.ExecuteScalar()}");
```

Real output, captured this session:

```
typeof(5) = integer
typeof('5') = text
```

No table is even involved yet — this is `typeof()`, from the Header above,
run directly against two bare literals. `5` and `'5'` look almost
identical — the same single digit — yet SQLite reports two completely
different **storage classes** for them, purely because one is quoted and one
isn't: unquoted `5` is a real SQL integer literal; `'5'` in single quotes is
a SQL text literal, a string that merely happens to look like a number.
Nothing has been declared or converted yet — this is just what each literal
already, natively, is.

Does asking SQLite to actively convert one into the other work? Continue the
same lab:

```csharp
using var castCommand = new SqliteCommand("SELECT typeof(CAST('5' AS INTEGER))", connection);
Console.WriteLine($"typeof(CAST('5' AS INTEGER)) = {castCommand.ExecuteScalar()}");

using var castRealCommand = new SqliteCommand("SELECT typeof(CAST('5' AS REAL))", connection);
Console.WriteLine($"typeof(CAST('5' AS REAL)) = {castRealCommand.ExecuteScalar()}");
```

Real output, captured this session:

```
typeof(CAST('5' AS INTEGER)) = integer
typeof(CAST('5' AS REAL)) = real
```

This is the **`CAST` expression** from the Header above, proven directly:
`CAST('5' AS INTEGER)` really does turn the text value `'5'` into a genuine
integer storage class, and `CAST('5' AS REAL)` turns the same text into a
genuine floating-point one — SQLite reads the digits inside the text and
reinterprets them as the requested storage class, rather than merely
labeling the same bytes differently. This exact conversion — a stored value
nudged toward a preferred storage class rather than rejected outright when
it doesn't already match — is called **type affinity**, and it's the same
mechanism a column's *declared* type invokes automatically on every value
stored into it, without needing an explicit `CAST` at all. SQLite's own
official documentation, fetched this session, states the underlying idea
directly, quoted verbatim: "Type affinity is the recommended type for data
stored in that column. The important idea here is that the type is
recommended, not required. Any column can still store any type of data. It
is just that some columns, given the choice, will prefer to use one storage
class over another." There are exactly five storage classes affinity ever
resolves to — `TEXT`, `NUMERIC`, `INTEGER`, `REAL`, `BLOB` — and SQLite's own
documentation states the exact algorithm used to assign one to a column from
its declared type name, quoted verbatim, checked in this order:

1. "If the declared type contains the string 'INT' then it is assigned
   INTEGER affinity."
2. "If the declared type of the column contains any of the strings 'CHAR',
   'CLOB', or 'TEXT' then that column has TEXT affinity. ... the type
   VARCHAR contains the string 'CHAR' and is thus assigned TEXT affinity."
3. "If the declared type for a column contains the string 'BLOB' or if no
   type is specified then the column has affinity BLOB."
4. "If the declared type for a column contains any of the strings 'REAL',
   'FLOA', or 'DOUB' then the column has REAL affinity."
5. "Otherwise, the affinity is NUMERIC."

This is a genuinely surprising rule worth taking seriously rather than
skimming past: SQLite isn't matching a fixed list of known type keywords at
all — it's checking whether the declared type name *contains a specific
substring*, in order, and stopping at the first match. That's precisely why
rule 3 above explains what the previous unit's untyped `name` column
actually got: "no type is specified" falls into the `BLOB`-affinity branch
of that very same rule, by name, not into some separate "no type" case.
SQLite's documentation is equally direct about what each affinity actually
*does* to an incoming value, quoted verbatim: for `TEXT` affinity, "If
numerical data is inserted into a column with TEXT affinity it is converted
into text form before being stored." For `NUMERIC` affinity (the fallback
rule 5 above lands on), "When text data is inserted into a NUMERIC column,
the storage class of the text is converted to INTEGER or REAL (in order of
preference) if the text is a well-formed integer or real literal ... If the
TEXT value is not a well-formed integer or real literal, then the value is
stored as TEXT" — conversion is attempted, but a failed conversion doesn't
raise an error; the original value is simply kept as-is. And `INTEGER`
affinity — the one this lesson's own numeric columns will actually
use — "behaves the same as a column with NUMERIC affinity. The difference
between INTEGER and NUMERIC affinity is only evident in a CAST expression:
The expression 'CAST(4.0 AS INT)' returns an integer 4, whereas
'CAST(4.0 AS NUMERIC)' leaves the value as a floating-point 4.0" — this
lesson's own lab, above, is a direct instance of exactly that distinction:
`CAST('5' AS INTEGER)` and `CAST('5' AS REAL)` produced two different real
storage classes from the identical starting text.

### Discard the Throwaway Example

`lab2.db` and every line of the lab above are discarded; none of it becomes
part of `ToolDB`.

### Project Change

- **Reference Source** — no reference counterpart consulted this session.
- **Files affected** — `Program.cs`, modified.
- **Change type** — replace (the `createTableSql` string's *value* from the
  previous unit is replaced with a richer definition; every other line is
  unchanged).
- **Location** — the `createTableSql` line added in the previous unit.
- **Dependencies** — the previous unit's `SqliteCommand`/`ExecuteNonQuery()`/
  `ExecuteScalar()` code, unchanged.
- **Manual step before running this checkpoint** — delete `tools.db`.
  `CREATE TABLE` cannot silently redefine a table that already exists — this
  lesson's own Closing proves that failure for real — and this lesson is
  still actively iterating on `tools`'s shape. Once the next unit finalizes
  it, later lessons build on top of the settled table without deleting it
  again.

### The New Code

```csharp
string createTableSql = "CREATE TABLE tools (name TEXT, manufacturer TEXT, overall_diameter REAL, overall_length REAL, flute_count INTEGER)";
```

### The Updated Project

Full `Program.cs`, the one changed line marked:

```csharp
using Microsoft.Data.Sqlite;

string connectionString = "Data Source=tools.db";

using var connection = new SqliteConnection(connectionString);
connection.Open();

Console.WriteLine($"Connected. State: {connection.State}");
Console.WriteLine($"Database file on disk: {File.Exists("tools.db")}");

string createTableSql = "CREATE TABLE tools (name TEXT, manufacturer TEXT, overall_diameter REAL, overall_length REAL, flute_count INTEGER)"; // ← changed
using var createTableCommand = new SqliteCommand(createTableSql, connection);
int rowsAffected = createTableCommand.ExecuteNonQuery();
Console.WriteLine($"CREATE TABLE executed. ExecuteNonQuery() returned: {rowsAffected}");

using var lookupCommand = new SqliteCommand(
    "SELECT sql FROM sqlite_schema WHERE type = 'table' AND name = 'tools'",
    connection);
object? storedSql = lookupCommand.ExecuteScalar();
Console.WriteLine($"sqlite_schema's stored SQL for 'tools': {storedSql}");
```

Every other line runs exactly as before; only the shape of the table being
defined has changed. `tools` now has five real columns instead of one, each
carrying a real, meaningful declared type — though, per this unit's own lab,
"meaningful" turns out to mean "recommended," not "enforced."

### Mechanical Walkthrough

- `"CREATE TABLE tools ("` — unchanged from the previous unit: the same
  `CREATE TABLE` statement, the same table name, `tools`.
- `name TEXT` — the same column name as the previous unit's sole column, now
  given a declared type. `TEXT` contains the literal substring `"TEXT"`, so,
  per rule 2 of the affinity algorithm quoted above, this column gets
  **TEXT affinity** — values stored here are converted to text form if
  they aren't already, exactly as this unit's lab proved for the bare
  literal `'5'`.
- `manufacturer TEXT` — the same `TEXT` affinity as `name`, applied to a
  second column; nothing new here beyond reappearing the same rule on a
  second, differently-named column.
- `overall_diameter REAL` — `REAL` contains the substring `"REAL"`, so, per
  rule 4, this column gets **REAL affinity** — a floating-point storage
  class, the same one this unit's lab produced directly with
  `CAST('5' AS REAL)`.
- `overall_length REAL` — the same `REAL` affinity as `overall_diameter`,
  applied to a second dimensional column.
- `flute_count INTEGER` — `INTEGER` contains the substring `"INT"`, so, per
  rule 1 — checked *first*, before any other rule gets a chance — this
  column gets **INTEGER affinity**, the same affinity this unit's lab
  produced with `CAST('5' AS INTEGER)`.
- `")"` — unchanged from the previous unit: closes the column list, exactly
  as before.

Every other line in the file — the `SqliteCommand` construction, the
`ExecuteNonQuery()` call, both `Console.WriteLine` calls, the
`sqlite_schema` lookup — is identical to the previous unit's own walkthrough;
nothing about *how* the statement is sent or verified changed, only *what*
the statement itself now says.

### CS Lens

A column's declared type acting as a hint the system nudges values toward,
rather than a rule it strictly enforces, is dynamic and gradual typing
showing up inside a database schema instead of inside a programming
language. Also recognized in: Python's own type hints, checked by nothing at
all unless a separate tool (like `mypy`) is deliberately run against them;
TypeScript's types, which are erased entirely at runtime and enforce
nothing once compiled to plain JavaScript; and C#'s own `dynamic` keyword, a
deliberate, explicit opt-out from the same static discipline Lesson 1 just
finished proving C# enforces everywhere else. Worth naming directly: Lesson
1 proved C# itself is strictly, statically typed — and this very lesson's
own C# code is talking, across the ADO.NET boundary, to a *database* engine
with the opposite philosophy at the column level. Two different type
disciplines, meeting at one connection.

### SE Lens

Why would a database engine deliberately choose *not* to enforce a column's
declared type? The alternative not chosen — strict typing, rejecting any
value that doesn't already match a column's declared type exactly, the way
PostgreSQL or SQL Server do — is a real, common, defensible design. SQLite's
actual, documented tradeoff instead favors flexibility: "any column can
still store any type of data," per its own docs quoted above, which fits
SQLite's typical role as a small, embedded, single-file engine, often fed
data from flexible or loosely-typed sources (a scripting language, a CSV
import, user-typed form input) where rejecting a slightly-off value outright
would be more disruptive than converting it and moving on. The real,
honest cost this project inherits today: a bug where a numeric column
silently ends up holding text can slip through completely undetected, right
now, with nothing in this schema currently able to catch it — Lesson 15's
`CHECK` constraints are the future fix this project doesn't have yet.

### Commands Needed

- `dotnet build` — reappearing: used here to confirm this checkpoint builds
  cleanly after `tools.db` is deleted and recreated with the new schema.
- `dotnet run` — reappearing: used here to run this unit's lab and the real
  checkpoint.

### Run It — Real Output

```
dotnet build
```

Real output, captured this session, from inside `ToolDB/` (after deleting
`tools.db`):

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
CREATE TABLE executed. ExecuteNonQuery() returned: 0
sqlite_schema's stored SQL for 'tools': CREATE TABLE tools (name TEXT, manufacturer TEXT, overall_diameter REAL, overall_length REAL, flute_count INTEGER)
```

### Connecting Back

`tools` now has five real, meaningfully typed columns — proven, by this
unit's own lab, to mean something looser than the static guarantee Lesson 1
proved for C# itself. One thing this table still can't do, though: nothing
in it can reliably tell two different tools apart if their name,
manufacturer, and every dimension happen to match. The next unit is exactly
that problem.

---

## Concept Unit: `PRIMARY KEY` and the Hidden `rowid`

### The Problem

None of `tools`'s five columns can reliably identify one specific row: two
different tools could share a name, a manufacturer, even every dimension,
with nothing in this schema currently able to tell them apart. Declaring a
**`PRIMARY KEY`** looks, on the surface, like it should fix this by creating
a brand-new mechanism dedicated to row identity — a fresh, purpose-built
answer to "which row is this, exactly." Does it actually build something
new, or does it wire up to a mechanism that was already there the whole
time?

### Introduce the Concept in Isolation

Back in `LabScratch`, a fresh scratch file, `lab3.db`:

```csharp
using Microsoft.Data.Sqlite;

if (File.Exists("lab3.db"))
{
    File.Delete("lab3.db");
}

using var connection = new SqliteConnection("Data Source=lab3.db");
connection.Open();

using var createIntPkCommand = new SqliteCommand(
    "CREATE TABLE with_int_pk (id INTEGER PRIMARY KEY, val TEXT)", connection);
createIntPkCommand.ExecuteNonQuery();

using var createTextPkCommand = new SqliteCommand(
    "CREATE TABLE with_text_pk (id TEXT PRIMARY KEY, val TEXT)", connection);
createTextPkCommand.ExecuteNonQuery();
```

Two tables, deliberately identical except for one thing: `with_int_pk`
declares its primary key column `INTEGER`; `with_text_pk` declares the exact
same role `TEXT`. SQLite's own documentation, fetched this session, makes a
specific, testable claim about the first case, quoted verbatim: "With one
exception noted below, if a rowid table has a primary key that consists of
a single column and the declared type of that column is 'INTEGER' in any
mixture of upper and lower case, then the column becomes an alias for the
**`rowid`**" — the hidden, always-present integer identifier, from the
Header above, that ordinarily exists on every SQLite table whether asked
for or not. (The one documented exception: a column declared with a
trailing `PRIMARY KEY DESC` clause does *not* become a rowid alias — not
used anywhere in this lesson's own schema.) An "alias" is a strong,
specific claim — not "SQLite creates something similar," but "this column
*is* the same already-existing thing, under a name you chose." Does the
declared type change what SQLite has to build to enforce uniqueness for
each table?

```csharp
using var intPkIndexCommand = new SqliteCommand(
    "SELECT name FROM sqlite_schema WHERE type = 'index' AND tbl_name = 'with_int_pk'", connection);
object? intPkIndexName = intPkIndexCommand.ExecuteScalar();
if (intPkIndexName is null)
{
    Console.WriteLine("Autoindex for with_int_pk (INTEGER PRIMARY KEY): null (none created)");
}
else
{
    Console.WriteLine($"Autoindex for with_int_pk (INTEGER PRIMARY KEY): {intPkIndexName}");
}

using var textPkIndexCommand = new SqliteCommand(
    "SELECT name FROM sqlite_schema WHERE type = 'index' AND tbl_name = 'with_text_pk'", connection);
object? textPkIndexName = textPkIndexCommand.ExecuteScalar();
if (textPkIndexName is null)
{
    Console.WriteLine("Autoindex for with_text_pk (TEXT PRIMARY KEY): null (none created)");
}
else
{
    Console.WriteLine($"Autoindex for with_text_pk (TEXT PRIMARY KEY): {textPkIndexName}");
}
```

Real output, captured this session:

```
Autoindex for with_int_pk (INTEGER PRIMARY KEY): null (none created)
Autoindex for with_text_pk (TEXT PRIMARY KEY): sqlite_autoindex_with_text_pk_1
```

Two genuinely different, real outcomes from what looked like the same
`PRIMARY KEY` declaration, twice. SQLite's own documentation, fetched this
session, explains exactly why, quoted verbatim: "In most cases, UNIQUE and
PRIMARY KEY constraints are implemented by creating a unique index in the
database. (The exceptions are INTEGER PRIMARY KEY and PRIMARY KEYs on
WITHOUT ROWID tables.)" `with_text_pk`'s primary key is a real **constraint**
from the Header above — one SQLite has to actively enforce by building a
genuine new **index**, `sqlite_autoindex_with_text_pk_1`, a name SQLite's
own documentation confirms follows the literal pattern
`"sqlite_autoindex_TABLE_N"`. `with_int_pk`'s primary key, though, needed no
such index at all — `null`, proven directly rather than assumed — because
its `id` column isn't a new thing SQLite had to build enforcement for; it's
the table's already-existing, already-unique `rowid`, wearing the name `id`.
This is the **rowid alias**, named directly: declaring `id INTEGER PRIMARY
KEY` doesn't create new storage or new enforcement machinery at all — it
takes a mechanism every ordinary SQLite table already has, whether asked for
or not, and gives it a name the rest of the schema, and later, real SQL
queries, can refer to directly.

### Discard the Throwaway Example

`lab3.db` and every line of the lab above are discarded; none of it becomes
part of `ToolDB`.

### Project Change

- **Reference Source** — no reference counterpart consulted this session.
- **Files affected** — `Program.cs`, modified.
- **Change type** — replace (the `createTableSql` string gains a new first
  column) and add (a new verification block after the existing
  `sqlite_schema` lookup).
- **Location** — the `createTableSql` line from the previous unit; the new
  block goes directly after the existing `lookupCommand`/`storedSql`
  code from the first unit.
- **Dependencies** — both previous units' code, unchanged.
- **Manual step before running this checkpoint** — delete `tools.db` again,
  the same reasoning as the previous unit: this is the schema's final
  shape, so this is the last time this lesson deletes it.

### The New Code

```csharp
string createTableSql = "CREATE TABLE tools (id INTEGER PRIMARY KEY, name TEXT, manufacturer TEXT, overall_diameter REAL, overall_length REAL, flute_count INTEGER)";
```

and, after the existing `sqlite_schema` lookup block:

```csharp
using var autoindexCommand = new SqliteCommand(
    "SELECT name FROM sqlite_schema WHERE type = 'index' AND tbl_name = 'tools'",
    connection);
object? autoindexName = autoindexCommand.ExecuteScalar();
if (autoindexName is null)
{
    Console.WriteLine("Autoindex for tools: null (none created)");
}
else
{
    Console.WriteLine($"Autoindex for tools: {autoindexName}");
}
```

### The Updated Project

Full `Program.cs`, changes marked:

```csharp
using Microsoft.Data.Sqlite;

string connectionString = "Data Source=tools.db";

using var connection = new SqliteConnection(connectionString);
connection.Open();

Console.WriteLine($"Connected. State: {connection.State}");
Console.WriteLine($"Database file on disk: {File.Exists("tools.db")}");

string createTableSql = "CREATE TABLE tools (id INTEGER PRIMARY KEY, name TEXT, manufacturer TEXT, overall_diameter REAL, overall_length REAL, flute_count INTEGER)"; // ← changed
using var createTableCommand = new SqliteCommand(createTableSql, connection);
int rowsAffected = createTableCommand.ExecuteNonQuery();
Console.WriteLine($"CREATE TABLE executed. ExecuteNonQuery() returned: {rowsAffected}");

using var lookupCommand = new SqliteCommand(
    "SELECT sql FROM sqlite_schema WHERE type = 'table' AND name = 'tools'",
    connection);
object? storedSql = lookupCommand.ExecuteScalar();
Console.WriteLine($"sqlite_schema's stored SQL for 'tools': {storedSql}");

using var autoindexCommand = new SqliteCommand(                                          // ← new
    "SELECT name FROM sqlite_schema WHERE type = 'index' AND tbl_name = 'tools'",        // ← new
    connection);                                                                          // ← new
object? autoindexName = autoindexCommand.ExecuteScalar();                                // ← new
if (autoindexName is null)                                                               // ← new
{                                                                                          // ← new
    Console.WriteLine("Autoindex for tools: null (none created)");                       // ← new
}                                                                                          // ← new
else                                                                                       // ← new
{                                                                                          // ← new
    Console.WriteLine($"Autoindex for tools: {autoindexName}");                          // ← new
}                                                                                          // ← new
```

This is `tools`'s finished shape for this lesson: six columns, the first one
a real primary key — and the file now proves, every time it runs, not only
that the table exists with exactly this definition, but that its primary
key cost nothing extra to enforce, exactly as this unit's lab predicted.

### Mechanical Walkthrough

- `id INTEGER PRIMARY KEY` — a new first column, `id`, declared `INTEGER`
  (rule 1 of the affinity algorithm: **INTEGER affinity**, the same rule
  `flute_count` already used) and marked `PRIMARY KEY` — the **constraint**
  from the Header above, naming `id` as the column that must uniquely
  identify every row `tools` will ever hold. Because it's a single column,
  declared exactly `INTEGER`, this is precisely the case this unit's lab
  proved becomes a **rowid alias** — `id` isn't new storage; it's this
  table's own already-existing `rowid`, wearing a name the rest of this
  project's future code can refer to directly.
- `, name TEXT, manufacturer TEXT, overall_diameter REAL, overall_length REAL, flute_count INTEGER`
  — unchanged from the previous unit: the same five columns, the same
  affinities, now simply following the new first column instead of leading
  the list.
- `using var autoindexCommand = new SqliteCommand("SELECT name FROM sqlite_schema WHERE type = 'index' AND tbl_name = 'tools'", connection);`
  — the same `SqliteCommand` constructor as every other statement this
  lesson has sent, this time asking `sqlite_schema` a different question:
  not "what `CREATE TABLE` text do you have" but "what index, if any, do you
  have for this table." `tbl_name` (not `name`) is used in the `WHERE`
  clause deliberately — per the Header's own `sqlite_schema` term, `tbl_name`
  is the column that names the table an index belongs *to*, distinct from
  `name`, which would be the index's own name, not yet known before it's
  looked up.
- `object? autoindexName = autoindexCommand.ExecuteScalar();` — the same
  nullable-`object?`-plus-`ExecuteScalar()` pattern as the first unit's
  `storedSql`, reused here for a query this lesson's lab already proved can
  genuinely come back `null`.
- `if (autoindexName is null) { ... } else { ... }` — an ordinary `if`/`else`
  statement, the same construct as any Python `if`/`else`, choosing between
  two different `Console.WriteLine` calls depending on whether
  `autoindexName` actually holds a value. This reappears from this same
  unit's own lab above, where it was used for the identical reason: printing
  the literal word `null` explicitly, rather than relying on string
  interpolation to render a missing value as blank, silent, and easy to
  misread as "the check didn't run" instead of "the check ran and correctly
  found nothing."

### CS Lens

A feature that *looks* new but turns out to be a thin, named wrapper around
a mechanism that already existed underneath is a real, recurring shape, not
unique to SQLite. Also recognized in: virtual memory, where a program's own
flat, private address space is a visible illusion built entirely on top of
physical memory the operating system was already managing; a CPU's register
renaming, where an "architectural" register name a program refers to is
resolved, at run time, to whichever real physical register the processor
actually assigned it; and Python's small-integer caching, where writing `5`
a second time doesn't necessarily create a new integer object at all — it
can hand back a reference to one the interpreter already had sitting around.
In every case, the visible name is real and usable, but assuming it names
newly-built machinery, rather than checking, would be exactly the same
mistake this unit's lab set out to catch.

### SE Lens

Why would SQLite special-case a single-column `INTEGER PRIMARY KEY` at all,
instead of always building a real, separate index for every `PRIMARY KEY`
the same uniform way it does for `with_text_pk` above? The alternative not
chosen — one code path, no exceptions, always build an index — would be
simpler to reason about as a rule. But SQLite's actual design leans on a
fact that's true of *every* ordinary table regardless of what a schema asks
for: a `rowid`, already unique, already indexed by SQLite's own internal
b-tree structure, for free, on every table. Requiring a second, separate
index for something that's already there, already unique, and already fast
to look up by would be pure duplicated bookkeeping and wasted disk space for
what is, in practice, the overwhelmingly common case — "the primary key is
just an integer ID." The real cost of the special case, honestly: a
genuinely surprising rule a reader has to learn explicitly, by name, rather
than one single uniform mental model covering every constraint the same way.

### Commands Needed

- `dotnet build` — reappearing: used here to confirm this checkpoint builds
  cleanly after `tools.db` is deleted and recreated with its final shape.
- `dotnet run` — reappearing: used here to run this unit's lab and the real,
  final checkpoint.

### Run It — Real Output

```
dotnet build
```

Real output, captured this session, from inside `ToolDB/` (after deleting
`tools.db`):

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
CREATE TABLE executed. ExecuteNonQuery() returned: 0
sqlite_schema's stored SQL for 'tools': CREATE TABLE tools (id INTEGER PRIMARY KEY, name TEXT, manufacturer TEXT, overall_diameter REAL, overall_length REAL, flute_count INTEGER)
Autoindex for tools: null (none created)
```

The final line is this unit's whole point, proven rather than asserted: no
autoindex exists for `tools`, confirming its `id` column really is the
rowid alias this unit's lab predicted, not a separately-enforced constraint
that happens to produce the same visible behavior.

### Connecting Back

`tools` now has everything this lesson set out to give it: six typed
columns and a primary key that costs nothing extra to enforce, both proven
by asking SQLite's own catalog rather than trusting the statement that
created them. What hasn't been tested yet is what happens when this exact
statement runs a *second* time against a file that already has this table —
exactly what this lesson's Closing does next.

---

## Closing

### Connect the Pieces

One trace, start to finish, using only what actually ran on this machine
this session. The first unit's `createTableSql` began as the smallest
possible real statement — `CREATE TABLE tools (name)` — sent through a
`SqliteCommand` and run with `ExecuteNonQuery()`, proven, by a real
before/after file-size check, to write genuine on-disk structure, and proven
a second way by reading the exact statement back out of SQLite's own
`sqlite_schema` catalog through `ExecuteScalar()`. The second unit replaced
that same string with five real, typed columns — `TEXT`, `REAL`, `INTEGER` —
each one resolved to a storage-class affinity by the exact substring-matching
algorithm SQLite's own documentation states, proven directly by casting bare
literals through that identical conversion mechanism with `CAST` and
`typeof()`, not merely read about. The third unit added one more column,
`id INTEGER PRIMARY KEY`, in front of the other five — proven, by the same
`sqlite_schema` catalog queried a new way, to need no separate index at all,
because a single-column `INTEGER PRIMARY KEY` doesn't create new storage; it
aliases the `rowid` every SQLite table already carries. Change any one
link — an untyped column silently keeping the wrong kind of data, a
`PRIMARY KEY` assumed to be enforced by machinery that was never actually
built for it — and a later lesson (inserting real rows, querying them back,
enforcing constraints) would be building on a claim that was never actually
checked.

### What Breaks Without This

Run the exact same, finished `Program.cs` a second time, without deleting
`tools.db` first:

```
dotnet run
```

Real output, captured this session:

```
Connected. State: Open
Database file on disk: True
Unhandled exception. Microsoft.Data.Sqlite.SqliteException (0x80004005): SQLite Error 1: 'table tools already exists'.
   at Microsoft.Data.Sqlite.SqliteException.ThrowExceptionForRC(Int32 rc, sqlite3 db)
   at Microsoft.Data.Sqlite.SqliteCommand.PrepareAndEnumerateStatements()+MoveNext()
   at Microsoft.Data.Sqlite.SqliteCommand.GetStatements()+MoveNext()
   at Microsoft.Data.Sqlite.SqliteDataReader.NextResult()
   at Microsoft.Data.Sqlite.SqliteCommand.ExecuteReader(CommandBehavior behavior)
   at Microsoft.Data.Sqlite.SqliteCommand.ExecuteReader()
   at Microsoft.Data.Sqlite.SqliteCommand.ExecuteNonQuery()
   at Program.<Main>$(String[] args) in .../ToolDB/Program.cs:line 13
```

This is `SqliteException`, reappearing from Lesson 1's own Closing, doing
exactly what it did there: failing loudly and specifically — SQLite's own
native error code 1, "table tools already exists" — instead of silently
doing nothing, or silently redefining the table's structure out from under
whatever's already stored in it. `CREATE TABLE` is not something that can be
safely re-run against a file that already has the table it names; every
checkpoint in this lesson that changed `tools`'s shape had to delete
`tools.db` first for exactly this reason, spelled out concretely now
instead of only asserted earlier. This isn't a gap this lesson leaves
open by accident — safely changing an already-deployed table's shape, without
just deleting and rebuilding it, is real, dedicated work this curriculum
picks up explicitly in Lesson 26 (Schema Migrations & Versioning). For now,
`tools.db` is left exactly as the successful run above created it — the
finished six-column table, with its primary key aliasing `rowid` — ready for
Lesson 3 to build on.

### Exercises

- Add a sixth column to a scratch copy of this lesson's `CREATE TABLE`
  statement — `sku TEXT UNIQUE` — and reuse this lesson's own autoindex
  lookup technique (`SELECT name FROM sqlite_schema WHERE type = 'index' AND
  tbl_name = ...`) to check whether SQLite built a real index to enforce it.
  Predict the answer before running it, using the exact quoted rule from
  this lesson's third unit ("UNIQUE and PRIMARY KEY constraints are
  implemented by creating a unique index ... The exceptions are INTEGER
  PRIMARY KEY and PRIMARY KEYs on WITHOUT ROWID tables") to reason about
  which case a plain `UNIQUE` column (not a primary key at all) actually
  falls into.
- Run `SELECT typeof(CAST('12.5' AS INTEGER))` yourself, through
  `ExecuteScalar()` in a scratch lab. Predict the result using this lesson's
  own quoted NUMERIC-affinity rule (a "well-formed integer or real literal")
  before running it, then check whether the prediction was right.
- Declare a column `price MONEY` in a scratch `CREATE TABLE` statement — a
  type name that doesn't contain `"INT"`, `"CHAR"`/`"CLOB"`/`"TEXT"`,
  `"BLOB"`, or `"REAL"`/`"FLOA"`/`"DOUB"`. Using this lesson's own quoted
  five-rule algorithm, predict which affinity it falls into before checking
  it — there's no dedicated inspection function for this in stock SQLite, so
  reason it out from the rules themselves, in order, the same way this
  lesson's own third unit reasoned about `id`'s type.

### Definition of Done

- [ ] `ToolDB/Program.cs` builds with `dotnet build` at 0 warnings, 0
      errors.
- [ ] `dotnet run` prints all five lines: `Connected. State: Open`,
      `Database file on disk: True`, the `CREATE TABLE executed` line, the
      `sqlite_schema`'s stored SQL for `tools` (matching this lesson's final
      six-column statement, `id INTEGER PRIMARY KEY` first), and
      `Autoindex for tools: null (none created)`.
- [ ] `tools.db` contains a real `tools` table with exactly six columns,
      confirmed via `sqlite_schema`, not merely assumed from the source
      code.
- [ ] The "what breaks" experiment above was actually run against the
      finished table, the real `SqliteException` ("table tools already
      exists") was seen, and `tools.db` was left in its successful,
      finished state afterward (not deleted again).
- [ ] A git commit exists containing the updated `Program.cs`, with a
      message explaining *why* (`tools.db` now has real, typed structure
      with a working primary key, verified against SQLite's own catalog —
      not just "add CREATE TABLE").

Next lesson: **Lesson 3 — Inserting Safely**, giving `tools` its first real
rows — and the first lesson where the difference between "SQL as inert data"
(this lesson's own CS Lens) and "SQL as an injected attack" stops being a
foreshadowed comment and becomes the actual subject.
