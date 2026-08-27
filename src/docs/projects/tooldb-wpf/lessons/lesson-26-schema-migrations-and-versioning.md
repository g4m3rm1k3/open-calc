# Lesson 26: A Schema Change Is a Real, Named, Repeatable Artifact (Schema Migrations & Versioning)

**What you will build.** Two real, independent answers to the same real
question — "how does a database file know which schema changes have
already happened to it?" First, `PRAGMA user_version`, applied for real to
this project's own live `tools.db`, a minimal, manual integer stamp.
Second, a real EF Core Migration — `Migrations/20260827003629_InitialCreate.cs`
— generated from `ToolDbContext`'s own real, current model, applied to a
disposable database, never the live one. The transferable problem
underneath the feature: every schema change this project has made since
Multiple Tables & `JOIN` was applied by hand, once, in whatever session
happened to write that lesson — real, working, but with nothing in the
database file itself recording *which* changes have already run, or
letting a second, different real machine repeat them safely.

**What you need to know first.** Schema Design — `CREATE TABLE`, and this
project's own real, established `id INTEGER PRIMARY KEY` convention,
directly contrasted against a real EF Core default in this lesson's
second unit. What an ORM Is and Isn't and Rewriting Your Queries Through
EF Core — `ToolDbContext`, its real Fluent API mapping, and the real
reason its own current model does not yet include `vendors`, `vendor_id`,
`last_modified`, or `tags`.

**Terms used in this lesson**

- **schema versioning** — recording, somewhere real and durable, which
  schema changes a specific real database file has already had applied to
  it. It exists so a second real copy of that file, or a later real
  session, can tell what state it's actually in, rather than a person
  having to inspect the real schema by hand and guess.
- **`PRAGMA user_version`** — a real, built-in SQLite pragma. Per
  sqlite.org's own real, fetched documentation (`sqlite.org/pragma.html`),
  "The user_version pragma will get or set the value of the user-version
  integer at offset 60 in the database header," and, critically, "The
  user-version is an integer that is available to applications to use
  however they want. SQLite makes no use of the user-version itself." It
  exists as a genuinely minimal, zero-setup real place to stash exactly
  one real integer, directly inside the database file, with no separate
  table needed at all.
- **migration** — a real, named, self-contained description of one
  specific schema change — what it does going forward (`Up`) and how to
  undo it (`Down`) — meant to be applied once, in order, and recorded
  afterward so it's never silently reapplied. It exists so a schema
  change becomes a real, reviewable, repeatable artifact a project keeps
  in source control, rather than a one-time action a person remembers (or
  forgets) having done.
- **`AUTOINCREMENT`** — a real, optional SQLite keyword, addable to an
  `INTEGER PRIMARY KEY` column. Per sqlite.org's own real documentation on
  `rowid` tables, a plain `INTEGER PRIMARY KEY` (this project's own
  established convention, Schema Design) is free to reuse a deleted row's
  old real `rowid` value for a new row; `AUTOINCREMENT` genuinely
  disables that reuse, guaranteeing every real `rowid` this table ever
  assigns is used exactly once, ever. It exists for real, specific cases
  where a reused ID would be genuinely unsafe (an ID stored externally and
  expected to always mean the same real row) — a guarantee this project's
  own `tools`/`vendors` tables have never needed and have never had.
- **design-time factory** — a real, specific-purpose class a project
  supplies so `dotnet ef`'s own tooling can construct a `DbContext`
  instance without running the real application itself. It exists because
  `dotnet ef` runs as a separate real process, at development time, with
  no real access to whatever real configuration (a `dataSource` string, an
  injected dependency) the application's own normal startup path would
  otherwise supply.

**Objects and methods used**

- **`Migration` / `MigrationBuilder` / `Up(MigrationBuilder)` / `Down(MigrationBuilder)`**
  - *What it is:* `Migration` is the real, abstract EF Core base class
    every generated migration file derives from; `MigrationBuilder` is the
    real object its own `Up`/`Down` methods receive, exposing real,
    schema-changing operations to call.
  - *Implementation:* real, generated shape, produced this session by
    `dotnet ef migrations add InitialCreate` (Commands Needed, below):
    `public partial class InitialCreate : Migration`, overriding
    `protected override void Up(MigrationBuilder migrationBuilder)` and
    `protected override void Down(MigrationBuilder migrationBuilder)`.
  - *Its use:* the real, concrete artifact this lesson's second unit
    builds — a permanent, real, inspectable record of "create the `tools`
    table," generated from `ToolDbContext`'s own current, real model, not
    hand-written.
  - *Type:* `Migration` is a real, `public`, `abstract` class;
    `MigrationBuilder` is a real, concrete class; `Up`/`Down` are real,
    `protected`, `override` instance methods (established What an ORM Is
    and Isn't).
  - *Responsibility:* `Migration`'s full real charter is representing one
    real, ordered schema change, forward and backward; `MigrationBuilder`'s
    is providing the real, fluent vocabulary (`CreateTable`, `AddColumn`,
    `DropColumn`, and others this lesson doesn't use) `Up`/`Down` are
    written against.
  - *Depends on:* EF Core's own real comparison between the current model
    (`ToolDbContext`'s own real `OnModelCreating`) and the previous real
    model snapshot (`ToolDbContextModelSnapshot.cs`, generated alongside
    it) — this project's first real migration has no previous snapshot to
    compare against, so everything in the current model is treated as new.
  - *Connects to:* applied by `dotnet ef database update` (Commands
    Needed, below), which calls `Up` in real, generated-file order; a real
    row recording that this happened is written to `__EFMigrationsHistory`
    (below).
  - *Shape:* a real, permanent, version-controlled project file — the
    first of its kind in this project, sitting in a new, real
    `ToolDB/Migrations/` folder.

- **`IDesignTimeDbContextFactory<TContext>` / `CreateDbContext(string[])`**
  - *What it is:* a real, generic EF Core interface a project implements
    to tell `dotnet ef`'s own tooling how to construct a specific
    `DbContext` at design time.
  - *Implementation:* this project's own new, real, permanent
    `ToolDbContextFactory`:
    ```csharp
    public class ToolDbContextFactory : IDesignTimeDbContextFactory<ToolDbContext>
    {
        public ToolDbContext CreateDbContext(string[] args)
        {
            return new ToolDbContext("migrations_demo.db");
        }
    }
    ```
  - *Its use:* the real, concrete fix for a real failure this lesson's
    first attempt at running `dotnet ef` hit directly (Introduce the
    Concept in Isolation, below) — `ToolDbContext`'s own real constructor
    requires a `string`, which `dotnet ef` has no way to supply on its
    own.
  - *Type:* a real, generic interface; `CreateDbContext` is the one real
    method implementing it must supply.
  - *Responsibility:* its full real charter is producing one real,
    fully-constructed `DbContext` instance, on demand, for `dotnet ef`'s
    own tooling to inspect or run migrations against — never used by this
    project's own real, running application itself.
  - *Depends on:* nothing beyond whatever this class's own real
    implementation chooses to supply — here, a fixed, real, dedicated file
    name, deliberately not `"tools.db"`.
  - *Connects to:* discovered automatically by `dotnet ef`, by real,
    reflection-based convention (any class implementing this interface,
    anywhere in the project); its own real return value is what every
    `dotnet ef migrations`/`database` command in this lesson actually
    operates on.
  - *Shape:* a real, tooling-only seam — like `ToQueryString()`
    (established What an ORM Is and Isn't), never called by this
    project's own real, running `MainWindow.xaml.cs`.

- **`MigrationBuilder.CreateTable(...)` / `.AddColumn<T>(...)` / `.DropColumn(...)`**
  - *What it is:* real, chained `MigrationBuilder` methods, each
    describing one real, specific schema operation.
  - *Implementation:* real, generated shapes, this session:
    `migrationBuilder.CreateTable(name: "tools", columns: table => new {
    ... }, constraints: table => { table.PrimaryKey(...); });` inside
    `InitialCreate.Up`; `migrationBuilder.AddColumn<DateTime>(name:
    "CreatedAt", table: "Notes", type: "TEXT", nullable: false,
    defaultValue: ...)` inside a second, real, isolated migration this
    lesson's own lab generated; `migrationBuilder.DropColumn(name:
    "CreatedAt", table: "Notes")` inside that same migration's own real
    `Down`.
  - *Its use:* the real, concrete vocabulary translating a C# model change
    into a real, executable schema change — `CreateTable` for a
    brand-new real table, `AddColumn`/`DropColumn` for evolving one that
    already exists.
  - *Type:* real, `public`, generic and non-generic instance methods.
  - *Responsibility:* each one's full real charter is describing exactly
    one real schema operation, later translated by EF Core's own real
    SQLite provider into the actual real SQL that runs.
  - *Depends on:* being called from inside a real `Migration`'s own
    `Up`/`Down` override.
  - *Connects to:* `AddColumn`'s own real, generated `defaultValue`
    (below) is a direct, real echo of a constraint this project's own
    real, hand-written migrations have already hit once before (Triggers)
    — SQLite's own real `ALTER TABLE ... ADD COLUMN` cannot add a `NOT
    NULL` column with no default to a table that may already hold real
    rows.
  - *Shape:* the real, declarative surface every generated migration is
    ultimately built from — a project only writes these by hand when
    amending a generated migration; ordinarily, `dotnet ef` writes them.

**Everything else in the file, not this lesson's own subject but still
explained**

- **`__EFMigrationsHistory` / `__EFMigrationsLock`**
  - *What it is:* two new, real tables EF Core's own tooling creates
    automatically, the first time any real migration is applied to a
    given database — never created or touched by this project's own code
    directly.
  - *Implementation:* real, observed schema, this session (via
    `sqlite3 migrations_demo.db ".schema"`): `__EFMigrationsHistory`
    stores one real row per applied migration (`MigrationId`,
    `ProductVersion`); `__EFMigrationsLock` coordinates real, concurrent
    `dotnet ef database update` runs so two don't race.
  - *Its use:* the real, concrete mechanism behind this lesson's own
    second unit's own central proof — that applying a second real
    migration only ever runs what's actually new.
  - *Type:* ordinary real SQLite tables, owned entirely by EF Core's own
    tooling.
  - *Responsibility:* recording, durably, real proof of exactly which
    real migrations have already run against this specific real database
    file.
  - *Depends on:* nothing beyond a real SQLite database EF Core Migrations
    has been applied to at least once.
  - *Connects to:* read by `dotnet ef database update` every time it
    runs, to decide which real, pending migrations still need applying.
  - *Shape:* real, EF-Core-owned infrastructure — conceptually similar to
    `sqlite_autoindex_vendors_1` (Indexes & Query Planning), a real,
    automatically-created artifact this project didn't ask for by name but
    now has to recognize.

---

## Concept Unit: `PRAGMA user_version` — The Simplest Real Version Stamp

### The Problem

Nothing about `tools.db`'s own real file tells a reader, or a second real
machine, which of this project's own many real schema changes — the
foreign key added in Multiple Tables & `JOIN`, the `CHECK` constraints
from Constraints & Data Integrity, the index, view, trigger, and JSON
column from Slice 4 — have actually been applied to it. Could a single
real integer, stored directly inside the database file itself, answer
that question, with no new table and no new tooling at all?

> **Try this first:** this project's own real `tools`/`vendors` tables
> already hold real, meaningful data a version number has no business
> living inside. Given that constraint, and given SQLite's own real
> database file already has a fixed-size real header (the same real
> header this project's own earlier lessons have already read
> `sqlite_version`/type-affinity information out of), where might a
> single, extra, real integer be stored without adding a new table at
> all?

### Introduce the Concept in Isolation

A minimal, real, throwaway database — never `tools.db` — proving
`PRAGMA user_version`'s own real behavior before this project's own real
file is touched:

```csharp
new SqliteCommand("PRAGMA user_version;", scratchConnection).ExecuteScalar();
new SqliteCommand("PRAGMA user_version = 1;", scratchConnection).ExecuteNonQuery();
new SqliteCommand("PRAGMA user_version;", scratchConnection).ExecuteScalar();
```

Run for real this session, against a fresh, disposable file: the real
value read back before setting it is `0` — SQLite's own real, documented
default — and `1` immediately after. This real, captured output proves
the Socratic question's own answer directly: this one real integer lives
in the database file's own header, needs no `CREATE TABLE`, and, per
sqlite.org's own real, fetched documentation (Terms, above), SQLite itself
"makes no use of the user-version" — its only real meaning is whatever
this project decides to give it.

### Discard the Throwaway Example

This exact throwaway scratch file is discarded now — it never appears in
this project again. What's proven is `PRAGMA user_version`'s own real
default and real read/write behavior — not this specific throwaway value.

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `tools.db`'s own real, live file, modified (one
  real integer in its own header — no table structure changes at all).
- **Change type** — configure.
- **Location** — the database file's own real header, not any real table.
- **Dependencies** — none.

### The New Code

```sql
PRAGMA user_version = 1;
```

### The Updated Project

Applied directly to the real, live `tools.db` this session
(`verification/lesson-26/step1-real-pragma-user-version.cs`):

```
--- real user_version before ---
0
--- real user_version after ---
1
```

`tools.db`'s own real, live file now carries a real, explicit version
stamp — `1`, chosen here to mean "the hand-evolved schema this project has
built through JSON Functions," a real, human-assigned meaning, not
anything SQLite itself interprets.

### Mechanical Walkthrough

- `PRAGMA user_version;` — `PRAGMA` (established Schema Design,
  reappearing) is SQLite's own real, non-standard statement form for
  reading or setting internal, engine-level settings — a plain `SELECT`
  cannot reach this real value; `user_version` (Header, above) names the
  specific real setting.
- `PRAGMA user_version = 1;` — the identical real `PRAGMA` statement form,
  now with a real, literal integer assigned instead of merely read —
  proven, by this unit's own real output, to genuinely persist across the
  connection closing (the two reads in the isolated lab used the same
  real connection; the live `tools.db` proof re-opened it in a fresh real
  script and still read `1` back).

### CS Lens

A single, real, fixed-size integer stored directly alongside a larger real
structure, meant only to record which version of that structure is
present, is a concrete instance of a **format version field** — the same
real idea behind a real file format's own magic-number-plus-version
header (a real `.zip`, `.png`, or `.class` file, established Records &
Strong Types' own real `javap`-adjacent inspection technique), or a real
network protocol's own version byte, sent before either side assumes what
the rest of a real message means. Also recognized in: a real API's own
`/v1/`, `/v2/` URL versioning; a real save-game file storing a schema
version so a later version of the same game can tell whether it needs to
upgrade an old save.

### SE Lens

Why reach for `PRAGMA user_version` at all, rather than jumping straight
to EF Core Migrations (this lesson's own second unit)? The real
alternative — skip straight to the heavier real tool — was rejected here
for a real, deliberate reason: this project's own real, live `tools.db`
already has a real schema EF Core Migrations doesn't yet know how to
safely take over (this unit's own next SE Lens explains exactly why).
`PRAGMA user_version` costs nothing to add today, to the real, live file,
with zero real risk to its own existing real structure — a single integer
in a header nothing else reads. Its own honest, real limit: it's just a
number a person has to remember the real meaning of; nothing enforces that
version `1` genuinely means what this lesson says it means, and nothing
here auto-generates the real change that number is supposed to represent,
the exact real gap Migrations (below) fills.

### Run It

A real, temporary scratch-file lab was run this session, proving
`PRAGMA user_version`'s own real default and set/read behavior. The real,
live `tools.db` had `PRAGMA user_version = 1;` applied directly this
session; real source and captured output saved in
`verification/lesson-26/step1-real-pragma-user-version.cs`.

### Connecting Back

`tools.db` now carries one real, explicit version marker — cheap, safe,
and honest about its own limits. The next unit introduces a real tool that
does far more than store a number: generating, applying, and tracking real
schema changes automatically — proven first against a database this
lesson deliberately keeps separate from the real, live one.

---

## Concept Unit: EF Core Migrations — Generating and Applying a Real Schema Change

### The Problem

Every real schema change this project has made so far — the index,
view, trigger, JSON column — was hand-written, run once, by a person,
against `tools.db` directly, with no permanent, real, checked-in record
of *how* to reproduce that exact change on a second real machine, or undo
it. `ToolDbContext`'s own real, current model (What an ORM Is and Isn't)
already fully describes what a `tools` table ought to look like, at least
for the columns it maps. Could that same real model be used to generate
the actual schema change automatically, as a real, reviewable file, rather
than a person writing `ALTER TABLE` by hand again?

> **Try this first:** `ToolDbContext`'s own constructor (established
> What an ORM Is and Isn't) requires a real `string dataSource` argument
> supplied by whatever code constructs it — until now, always this
> project's own real tests. A separate, real command-line tool
> (`dotnet ef`) has no access to this project's own running code at all.
> Given that, what real information would such a tool need from this
> project, and in what real form, before it could construct a
> `ToolDbContext` on its own?

### Introduce the Concept in Isolation

A real, direct attempt to run `dotnet ef` against `ToolDbContext`, before
any fix exists, run this session:

```
dotnet tool run dotnet-ef migrations list --context ToolDbContext
```

Real, captured failure:

```
Unable to create a 'DbContext' of type 'ToolDbContext'. The exception 'Unable to resolve service for type 'System.String' while attempting to activate 'ToolDbContext'.' was thrown while attempting to create an instance.
```

This real, captured output proves the Socratic question's own answer
directly: `dotnet ef` tried to construct a `ToolDbContext` on its own and
had no real value to pass for its own required `string` parameter. The
real fix is a **design-time factory** (Terms, above) — proven next, this
time against a fully separate, real, throwaway `Note`/`NoteContext` pair
(never `Tool`/`ToolDbContext`), to see the entire real migration mechanism
work end to end before trusting it against this project's own real
model:

```csharp
public class Note
{
    public int Id { get; set; }
    public string Text { get; set; } = "";
}

public class NoteContext : DbContext
{
    public DbSet<Note> Notes => Set<Note>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSqlite("Data Source=notes_demo.db");
    }
}
```

`NoteContext`'s own parameterless constructor needs no factory at all — a
real, deliberate simplification for this isolated lab. `dotnet ef
migrations add InitialCreate --context NoteContext`, then `dotnet ef
database update --context NoteContext`, both run for real this session,
produce a real `Notes` table. The real model then evolves — one new real
property, `public DateTime CreatedAt { get; set; }` — and a second real
migration, `dotnet ef migrations add AddCreatedAt --context NoteContext`,
generates:

```csharp
protected override void Up(MigrationBuilder migrationBuilder)
{
    migrationBuilder.AddColumn<DateTime>(
        name: "CreatedAt",
        table: "Notes",
        type: "TEXT",
        nullable: false,
        defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
}
```

Applied for real, the real `__EFMigrationsHistory` table (Header, above)
then holds two real rows, in real, applied order:

```
20260827003856_InitialCreate|9.0.9
20260827003933_AddCreatedAt|9.0.9
```

This real, captured evidence proves migration (Terms, above) genuinely
means what it claims: a second real command only ever applied the one
real, new change, leaving the first one's own real effect untouched and
unrepeated.

### Discard the Throwaway Example

The entire `Note`/`NoteContext` lab — its own real `Migrations/` folder
and `notes_demo.db` — is discarded now; it never appears in this project
again. What's proven is that EF Core Migrations genuinely tracks and
applies only real, new changes, in real order — not this specific
throwaway `Note` entity.

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/ToolDB.csproj`, modified (new
  `Microsoft.EntityFrameworkCore.Design` package reference).
  `ToolDB/ToolDbContextFactory.cs`, created.
  `ToolDB/Migrations/20260827003629_InitialCreate.cs` (+ its own
  `.Designer.cs` and `ToolDbContextModelSnapshot.cs`), generated by
  `dotnet ef`, not hand-written. A new, real,
  `code/.config/dotnet-tools.json` local tool manifest, created (records
  `dotnet-ef` as a project-local tool, not installed globally).
- **Change type** — add.
- **Location** — `ToolDbContextFactory.cs` sits alongside `ToolDbContext.cs`;
  `Migrations/` is a brand-new folder.
- **Dependencies** — the real `Microsoft.EntityFrameworkCore.Design`
  package and the real `dotnet-ef` local tool (Commands Needed, below);
  `ToolDbContext`'s own already-existing real model (What an ORM Is and
  Isn't).

### The New Code

```csharp
public class ToolDbContextFactory : IDesignTimeDbContextFactory<ToolDbContext>
{
    public ToolDbContext CreateDbContext(string[] args)
    {
        return new ToolDbContext("migrations_demo.db");
    }
}
```

### The Updated Project

`ToolDB/ToolDbContextFactory.cs`, a brand-new file (Project Change already
covers the "brand-new file" case):

```csharp
1  public class ToolDbContextFactory : IDesignTimeDbContextFactory<ToolDbContext>
2  {
3      public ToolDbContext CreateDbContext(string[] args)
4      {
5          return new ToolDbContext("migrations_demo.db");
6      }
7  }
```

With this real file present, `dotnet ef migrations add InitialCreate
--context ToolDbContext` succeeds for real, generating
`Migrations/20260827003629_InitialCreate.cs` — its real, generated `Up`
shown in full in this lesson's own Header (`Migration`/`MigrationBuilder`
entry, above). Applied for real via `dotnet ef database update --context
ToolDbContext`, against a fresh, disposable `migrations_demo.db` — real,
resulting schema, via `sqlite3`:

```
CREATE TABLE IF NOT EXISTS "tools" (
    "Id" INTEGER NOT NULL CONSTRAINT "PK_tools" PRIMARY KEY AUTOINCREMENT,
    "Name" TEXT NOT NULL,
    "overall_diameter" REAL NOT NULL,
    "overall_length" REAL NOT NULL,
    "flute_count" INTEGER NOT NULL
);
CREATE TABLE sqlite_sequence(name,seq);
```

Two real, notable findings, worth knowing before this project ever
migrates the real, live `tools.db`: first, this real, generated `tools`
table has only five real columns — `Manufacturer` stays excluded
(`Ignore`, established What an ORM Is and Isn't), and `vendor_id`,
`last_modified`, and `tags` are entirely absent, because nothing in
`ToolDbContext`'s own real, current model maps them; this real migration
reflects the *model*, not the real, live database's own larger, actual
shape. Second, the real, generated `Id` column carries `AUTOINCREMENT`
(Terms, above) — genuinely different from this project's own established,
real `id INTEGER PRIMARY KEY` convention, which has never used it — and a
new, real `sqlite_sequence` table appears alongside it, since SQLite
itself creates one automatically the moment any real table uses
`AUTOINCREMENT`.

### Mechanical Walkthrough

- `public class ToolDbContextFactory : IDesignTimeDbContextFactory<ToolDbContext>`
  — `class`/`:`(inheritance syntax) (reappearing) — here implementing a
  real, generic interface (Header, above) rather than deriving from a real
  class, the identical real relationship `AboutViewModel : INotifyPropertyChanged`
  already established (a class fulfilling a real interface's contract,
  reappearing).
- `public ToolDbContext CreateDbContext(string[] args)` — an ordinary real,
  `public` instance method (reappearing), fulfilling `IDesignTimeDbContextFactory<TContext>`'s
  own real, required member; `string[] args` (reappearing, established
  Environment & Project Setup's own command-line entry point) is supplied
  by `dotnet ef` itself, unused by this real, deliberately simple
  implementation.
- `return new ToolDbContext("migrations_demo.db");` — `new ToolDbContext(...)`
  (established What an ORM Is and Isn't, reappearing) constructs a real
  instance, supplying the one real `string` `dotnet ef` could never have
  supplied on its own — the real, direct fix for this unit's own opening
  failure.

### CS Lens

A design-time factory (Terms, above) is a concrete instance of the
**Factory pattern** — a dedicated, real object whose only real job is
constructing another real object correctly, so the code that needs an
instance never has to know the real details of building one. This project
has already used the identical real idea by a different real name:
`Tool.FromReader` (established Querying Back) is a real factory method,
turning one real `SqliteDataReader` row into one real `Tool`, so calling
code never has to know which real reader column goes where. Also
recognized in: any real GUI toolkit's own `Builder`/`Factory` classes for
constructing complex real widgets; a real dependency-injection container,
which is, at its core, a large, generalized real factory for whatever
types a real application asks it to construct.

### SE Lens

Why does this real design-time factory hardcode `"migrations_demo.db"`,
never `"tools.db"`, and why does this lesson apply the resulting real
migration only to that disposable file, never the real, live database?
The real alternative — pointing this factory at `"tools.db"` directly —
was deliberately rejected, for a real, concrete, structural reason this
unit's own real evidence already proved: the real, generated migration
only knows about the five real columns `ToolDbContext`'s own current
model actually maps, and adds a real `AUTOINCREMENT` convention this
project's own real, live schema has never used. Running `dotnet ef
database update` against the real, live `tools.db` today would attempt to
`CREATE TABLE tools`, and SQLite would refuse outright — the real table
already exists, with a real, different, larger shape EF Core knows
nothing about. **This is a real, deliberately deferred decision, stated
directly rather than silently avoided:** safely adopting EF Core
Migrations for a project whose real schema was already hand-evolved
requires a real *baseline* migration — one that describes the real,
already-existing schema exactly and is marked as already applied,
without ever actually running its own `CreateTable` calls — a real,
distinct technique this lesson does not attempt against the live file.
The honest, real cost of deferring it: `tools.db`'s own real schema and
`ToolDbContext`'s own real model can now silently drift further apart
over time, with nothing yet in place to catch that the way Migrations
eventually could, once this project deliberately takes on that real
bootstrapping work.

### Run It

A real `dotnet build` was run this session: build succeeded, 0 new
Warnings, 0 Errors. `Microsoft.EntityFrameworkCore.Design` was added to
`ToolDB.csproj`, and `dotnet-ef` was installed as a real, local tool
(Commands Needed, below). `dotnet ef migrations add InitialCreate` and
`dotnet ef database update` were both run for real against `ToolDbContext`,
producing the real files and real schema shown above, against a disposable
`migrations_demo.db`, since deleted. The full, separate `Note`/`NoteContext`
evolution proof was also run for real, in isolation. Real source and
captured output for both are saved in
`verification/lesson-26/lab1-and-step2-design-time-factory-and-initial-migration.md`
and `verification/lesson-26/lab3-real-migration-evolution-note-demo.md`.
`ToolDB.Tests`' full suite still passes, unchanged: **30 tests, 0
failures** — this lesson added no new C# entity code and no new tests,
only real tooling and a real, generated migration.

### Connecting Back

`ToolDbContext`'s own real model can now generate a real, permanent,
reviewable migration on demand, proven correct and repeatable against a
disposable database — with the real, honest limit of today's own real
model (missing `vendors`, `last_modified`, `tags`) and the real risk of
running it against the live, hand-evolved `tools.db` both stated plainly,
not glossed over.

---

## Commands Needed

- `dotnet new tool-manifest` — run once, inside `code/`. `dotnet` and
  `new` are established Environment & Project Setup; `tool-manifest`
  creates a real, project-local `.config/dotnet-tools.json` file, letting
  a command-line tool like `dotnet-ef` be installed *for this project
  specifically*, rather than globally for every project on the machine.
  Real success output names the real template used.
- `dotnet tool install dotnet-ef --version 9.0.9` — `tool install` adds
  one real entry to that same real manifest and downloads the real tool;
  `--version 9.0.9` pins it to match this project's own real EF Core
  package version, the identical real reasoning behind pinning
  `Microsoft.EntityFrameworkCore.Sqlite` itself (What an ORM Is and
  Isn't). Real success output names the real installed tool and version,
  and states it can be run via `dotnet tool run dotnet-ef`.
- `dotnet add package Microsoft.EntityFrameworkCore.Design --version 9.0.9`
  — the identical real command shape established What an ORM Is and
  Isn't; this real package supplies the design-time machinery `dotnet ef`
  itself depends on, distinct from the `Microsoft.EntityFrameworkCore.Sqlite`
  package this project already has, which only supplies real, run-time
  querying/saving behavior.
- `dotnet tool run dotnet-ef migrations add <Name> --context <ContextName>`
  — `tool run` invokes this project's own local tool, rather than
  requiring it on the system-wide `PATH`; `migrations add` compares the
  named `DbContext`'s own current real model against its own last real
  snapshot and generates one real migration file; `--context` names which
  real `DbContext` to use, needed here since `dotnet ef` has no other real
  way to choose between `ToolDbContext` and, in this lesson's own
  isolated lab, `NoteContext`. Real success output ends with "Done. To
  undo this action, use 'ef migrations remove'."
- `dotnet tool run dotnet-ef database update --context <ContextName>` —
  `database update` applies every real, not-yet-applied migration, in
  real order, to whichever real database the named context's own
  `OnConfiguring` (or, at design time, its own `IDesignTimeDbContextFactory`)
  points at. Real success output names each real migration actually
  applied.

---

## Connect the Pieces

Two real, independent, complementary answers to the same real question,
traced through both units:

1. `tools.db`'s own real, live file gained a single, real, explicit
   version marker — `PRAGMA user_version = 1` — cheap, safe, and honest
   about being nothing more than an integer a person has to remember the
   meaning of (Unit 1).
2. `ToolDbContext`'s own real, current model was proven capable of
   generating a real, permanent, reviewable migration automatically — a
   real design-time factory fixed the one real gap `dotnet ef` hit trying
   to construct it, and a fully separate, real, throwaway `Note` lab
   proved the whole real mechanism (generate, apply, evolve, apply again)
   works correctly, before this project's own real `InitialCreate`
   migration was generated and applied — deliberately, only against a
   disposable file, never the real, live `tools.db`, whose own hand-evolved
   real schema this lesson explicitly, honestly leaves for a future
   baseline-migration effort to take on (Unit 2).

**Slice 5 is complete.** **Next lesson:** 27 — Multiple Database Files
(`ATTACH DATABASE`) — the start of Slice 6.
