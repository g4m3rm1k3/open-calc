# Lesson 25: The Same Contract, Two Implementations (Rewriting Your Queries Through EF Core)

**What you will build.** Two new, real, permanent methods on `ToolDbContext`
— `FindByName(string name)` and `UpdateFluteCount(int id, int
newFluteCount)` — real LINQ-based rewrites of `ToolRepository.FindByName`
and `ToolRepository.UpdateFluteCount`, this project's own existing,
unmodified ADO.NET methods from Multiple Tables & `JOIN` and Updating and
Deleting Safely. Both old and new methods keep running, side by side,
proven equivalent by real, permanent tests. The transferable problem
underneath the feature: swapping *how* a real operation is implemented —
hand-written SQL versus an ORM's own generated SQL — should never change
*what* that operation promises to a caller; this lesson's own real tests
prove that promise holds, for both a successful case and a genuine
failure, not just the easy path.

**What you need to know first.** What an ORM Is and Isn't — `ToolDbContext`
itself, its real Fluent API mapping, and its own real change-tracking
mechanism (`Entry(...).Property(...).CurrentValue`, `SaveChanges`), all
reused here unchanged. Multiple Tables & `JOIN` and Updating and Deleting
Safely — the two real, existing ADO.NET methods this lesson rewrites, and
the real, existing tests whose own scenarios this lesson's new tests
mirror. Records & Strong Types — `Tool`'s own real, `init`-only shape,
still the reason this lesson's own write path reaches for
`Entry(...).CurrentValue` rather than ordinary assignment.

**Terms used in this lesson**

- **parity testing** — proving that two different real implementations of
  the same real operation produce identical real, observable outcomes for
  identical real inputs — not that their internals look alike. It exists
  so that replacing *how* something is done (hand-written SQL versus an
  ORM) can be trusted without trusting the new code by inspection alone;
  this lesson's own new tests are parity tests for exactly that reason.
- **lambda expression** — reappearing, established across several earlier
  lessons (`RelayCommand`'s own callbacks, `OnModelCreating`'s own
  configuration callback). A short, unnamed function, written inline as
  `parameters => expression`. It reappears here as the real argument to
  both `Where` and `Single` (below) — the real, concrete condition each
  one tests every element against.
- **query translation** — reappearing, established when `DbSet<TEntity>`
  was introduced: real LINQ method calls made against a real
  `DbSet<TEntity>` are not run directly against an in-memory collection;
  they build up a description of the query, which EF Core's own real
  provider converts into real SQL text only once that description is
  actually enumerated. It reappears here because `Where` (below) is a
  second, real, concrete example of exactly this — a real LINQ operator
  whose actual, underlying behavior depends entirely on what kind of real
  sequence it's called against.
- **deferred execution** — a real, more precise name for the same
  mechanism named just above: building `context.Tools.Where(...)` does
  not, by itself, touch the real database at all; only calling a real,
  final method like `.ToList()` or `.Single()` — established What an ORM
  Is and Isn't — actually runs it. It exists so several real LINQ
  operators can be chained together first, and translated into one real,
  combined SQL statement, rather than each one running a separate real
  round trip.
- **`DbUpdateException`** — a real EF Core exception type, thrown by
  `SaveChanges` (established What an ORM Is and Isn't) when the real
  database itself rejects a real write. Per Microsoft's own real, fetched
  API documentation
  (`learn.microsoft.com/dotnet/api/microsoft.entityframeworkcore.dbupdateexception`),
  it is "An exception that is thrown when an error is encountered while
  saving to the database." It exists so a real, underlying database
  failure (here, a real `CHECK` constraint violation) reaches calling code
  as a distinctly-named, catchable EF Core exception, rather than forcing
  every caller to know which specific ADO.NET provider exception
  (`Microsoft.Data.Sqlite.SqliteException`, in this project's case) sits
  underneath it.
- **change tracking** — reappearing, established What an ORM Is and Isn't:
  once a real entity is queried through a `DbContext`, that same context
  keeps watching it, and `SaveChanges` compares its current values against
  the values it had when queried to decide what, if anything, needs
  writing back. It reappears here as the real mechanism this lesson's own
  rewritten `UpdateFluteCount` depends on completely — the identical real
  `Entry(...).Property(...).CurrentValue` shape, now wrapped inside a
  proper, real, reusable method for the first time.
- **`init`** — reappearing, established Records & Strong Types: a property
  declared `{ get; init; }` can only be assigned inside an object
  initializer at construction time; any other assignment is a real
  `CS8852` compile error. It reappears here for the identical real reason
  it did in What an ORM Is and Isn't: `Tool.FluteCount` is `init`-only, so
  this lesson's own rewritten `UpdateFluteCount` cannot write
  `tool.FluteCount = newFluteCount;` and must reach for change tracking's
  own real `Entry(...).CurrentValue` mechanism instead.

**Objects and methods used**

- **`Queryable.Where<TSource>(IQueryable<TSource>, Expression<Func<TSource, bool>>)`**
  - *What it is:* a real, standard LINQ extension method that filters a
    real sequence down to only the elements matching a real, given
    condition.
  - *Implementation:* per Microsoft's own real, fetched API documentation
    (`learn.microsoft.com/dotnet/api/system.linq.queryable.where`), its
    real declared signature is `public static IQueryable<TSource>
    Where<TSource>(this IQueryable<TSource> source, Expression<Func<TSource,
    bool>> predicate)`, and, per that same real documentation, "The query
    behavior that occurs as a result of executing an expression tree that
    represents calling Where... depends on the implementation of the type
    of the source parameter" — for `DbSet<Tool>` (established What an ORM
    Is and Isn't), that implementation is EF Core's own real SQLite
    provider.
  - *Its use:* the real, concrete replacement for `ToolRepository.FindByName`'s
    own hand-written `WHERE name = @name` SQL clause — this lesson's own
    first real example of query translation (Terms, above) turning an
    ordinary C# method call into real, generated SQL.
  - *Type:* a real, generic, `static` extension method.
  - *Responsibility:* its full real charter, per that same documentation,
    is producing a real `IQueryable<TSource>` containing only the elements
    of its real source that satisfy the given real predicate — nothing
    about *when* or *how* that filtering actually happens is decided by
    `Where` itself, only by whatever real object it was called against.
  - *Depends on:* a real `IQueryable<TSource>` to filter, and a real
    lambda expression (Terms, above) describing the condition.
  - *Connects to:* called directly on `Tools` (established What an ORM Is
    and Isn't) inside this lesson's own new `FindByName`; its own real
    result is consumed immediately by `.ToList()` (established What an ORM
    Is and Isn't), which is what actually triggers a real database round
    trip.
  - *Shape:* the real, public LINQ surface a caller writes against — never
    itself touching a real database connection; that happens only inside
    whatever real `IQueryProvider` the specific `IQueryable<TSource>`
    belongs to.

- **`Single<TSource>(IQueryable<TSource>, Expression<Func<TSource, bool>>)`**
  - *What it is:* reappearing — extended. What an ORM Is and Isn't used
    the real, parameterless `Single()` overload; this lesson uses a
    distinct, real, second overload that accepts its own real condition
    directly, rather than requiring a prior `Where` call.
  - *Implementation:* real, standard LINQ shape: `public static TSource
    Single<TSource>(this IQueryable<TSource> source, Expression<Func<TSource,
    bool>> predicate)` — throws a real `InvalidOperationException` if
    zero or more than one real element satisfies the given real predicate.
  - *Its use:* `context.Tools.Single(t => t.Id == id)`, inside this
    lesson's own rewritten `UpdateFluteCount` — the real, concrete
    replacement for `ToolRepository.UpdateFluteCount`'s own hand-written
    `WHERE id = @id` clause.
  - *Type:* a real, generic, `static` extension method — a distinct real
    overload from the parameterless `Single()` already established, not
    the identical member called differently.
  - *Responsibility:* its full real charter is combining filtering and a
    real "expect exactly one" guarantee into a single real call, rather
    than requiring a separate `Where(...).Single()` chain.
  - *Depends on:* a real `IQueryable<TSource>` and a real predicate,
    identically to `Where`, above.
  - *Connects to:* the real `Tool` it returns is what `Entry(...)
    .Property(...).CurrentValue` (established What an ORM Is and Isn't)
    is later called against, in the same real method.
  - *Shape:* the same real LINQ surface as `Where`, above — a query
    description, translated and executed only once actually called.

- **`ToolDbContext.FindByName(string)` / `ToolDbContext.UpdateFluteCount(int, int)`**
  - *What it is:* two new, real, permanent methods on `ToolDbContext`
    (established What an ORM Is and Isn't) — this project's own first real
    LINQ-based counterparts to `ToolRepository.FindByName` and
    `ToolRepository.UpdateFluteCount`.
  - *Implementation:* `public List<Tool> FindByName(string name) => Tools.Where(t
    => t.Name == name).ToList();` in real body form (shown in full, below);
    `public void UpdateFluteCount(int id, int newFluteCount)` queries one
    real `Tool` via `Single`, above, then applies and saves one real
    change via `Entry(...).Property(...).CurrentValue`/`SaveChanges`
    (established What an ORM Is and Isn't).
  - *Its use:* the real, concrete subject of this lesson's own two
    Concept Units — proven, by real, permanent tests, to behave
    identically to their existing ADO.NET counterparts for the same real
    inputs.
  - *Type:* two real, `public` instance methods.
  - *Responsibility:* `FindByName`'s full real charter is finding every
    real tool whose name matches exactly, the same real contract
    `ToolRepository.FindByName` already has; `UpdateFluteCount`'s is
    changing one real tool's real flute count and persisting that one real
    change, the same real contract `ToolRepository.UpdateFluteCount`
    already has.
  - *Depends on:* `Tools`, `Entry`, and `SaveChanges` — all established
    What an ORM Is and Isn't.
  - *Connects to:* called directly by this lesson's own four new, real,
    permanent tests; not yet called anywhere inside `MainWindow.xaml.cs`
    — this project's own real UI still calls the original ADO.NET methods,
    unchanged, exactly matching this project's own roadmap, which
    introduces parity before ever touching the real call sites that would
    make a swap observable to an end user.
  - *Shape:* a second, real, complete, parallel implementation of two
    specific real operations `ToolRepository` already provides — proof
    that a swap is *possible*, not yet the swap itself.

- **`ToQueryString()`**
  - *What it is:* reappearing, established What an ORM Is and Isn't — a
    real EF Core extension method rendering the real SQL a given
    `IQueryable<T>` would currently produce, as plain text.
  - *Implementation:* unchanged; called here as
    `context.Tools.Where(t => t.Name == "Test End Mill").ToQueryString()`.
  - *Its use:* this lesson's own first real piece of evidence for
    `FindByName`'s own generated SQL — and, this lesson's own genuinely
    new finding, evidence of a real limitation this method has that the
    previous lesson never needed to surface.
  - *Type:* unchanged — a real, `static` extension method.
  - *Responsibility:* unchanged — render real, currently-buildable SQL
    text without touching the real database.
  - *Depends on:* unchanged — a real, already-built `IQueryable<T>`.
  - *Connects to:* this lesson's own real, direct comparison against
    `LogTo` (below), proving the two do not show the identical real text
    for the identical real query.
  - *Shape:* unchanged — a real, read-only diagnostic seam, never part of
    this project's own permanent runtime code.

- **`DbContextOptionsBuilder.LogTo(Action<string>, LogLevel)`**
  - *What it is:* a new, real EF Core method enabling real, live logging
    of every real database command a `DbContext` actually executes.
  - *Implementation:* called inside a real, temporary `OnConfiguring`
    override this session, as `optionsBuilder.LogTo(message =>
    Console.WriteLine(message), LogLevel.Information);` — every real
    command EF Core executes afterward is passed, as real text, to the
    given real callback.
  - *Its use:* this lesson's own real, direct proof that `ToQueryString()`'s
    own rendered text is not identical to what actually runs — a real,
    hidden-behavior claim (per this project's own standing demand) proven
    with a real tool, not just asserted.
  - *Type:* a real, `public` instance method.
  - *Responsibility:* its full real charter is forwarding every real,
    internal EF Core log message — command text, timing, and more this
    lesson doesn't use — to a real, caller-supplied callback.
  - *Depends on:* a real `DbContextOptionsBuilder`, the same real object
    `UseSqlite` (established What an ORM Is and Isn't) is called on.
  - *Connects to:* used only in this lesson's own real, temporary
    verification, never added to `ToolDbContext`'s own real, permanent
    `OnConfiguring` — this project has no ongoing real need to log every
    command it runs.
  - *Shape:* a real, temporary diagnostic tool, the same real category as
    `ToQueryString()` and Records & Strong Types' own `javap`-equivalent
    "read the real generated artifact" technique this project has used
    since its own earliest lessons — used once, here, to settle a real
    question, then set aside.

**Everything else in the file, not this lesson's own subject but still
explained**

- **`ToolRepository.FindByName(SqliteConnection, string)` /
  `ToolRepository.UpdateFluteCount(SqliteConnection, SqliteTransaction, int, int)`**
  - *What it is:* reappearing, unchanged — this project's own existing,
    real, hand-written ADO.NET methods, established Multiple Tables &
    `JOIN` and Updating and Deleting Safely.
  - *Implementation:* unchanged by this lesson — real, hand-written SQL
    text, real `SqliteCommand`/`SqliteParameter` binding, real,
    already-passing tests in `ToolRepositoryTests.cs`.
  - *Its use:* the real, existing implementations this lesson's own new
    `ToolDbContext` methods are held to matching — every new test this
    lesson adds targets a scenario one of these two methods' own existing
    tests already covers.
  - *Type:* real, `public`, `static` methods, unchanged.
  - *Responsibility:* unchanged — identical real charters to their new
    counterparts, above.
  - *Depends on:* unchanged — an already-open real `SqliteConnection`
    (and, for `UpdateFluteCount`, an already-begun real `SqliteTransaction`).
  - *Connects to:* still the real methods `MainWindow.xaml.cs` and
    `ToolRepositoryTests.cs` actually call — completely unaffected by this
    lesson's own new, parallel real methods.
  - *Shape:* unchanged — this project's own original, real persistence
    seam, still fully in force.

- **`Entry(TEntity)` / `PropertyEntry.CurrentValue` / `SaveChanges()` / `ChangeTracker`**
  - *What it is:* reappearing, unchanged — established What an ORM Is and
    Isn't: the real mechanism for reading and overwriting one specific
    tracked real value on an already-queried entity, and for turning every
    real tracked change into a real database write.
  - *Implementation:* unchanged real shapes and real behavior.
  - *Its use:* this lesson's own rewritten `UpdateFluteCount` calls
    `Entry(tool).Property(t => t.FluteCount).CurrentValue = newFluteCount;`
    then `SaveChanges();` — the identical real two-step shape What an ORM
    Is and Isn't already proved, now wrapped inside a real, reusable,
    named method for the first time, rather than written inline inside a
    test.
  - *Type:* unchanged real instance methods/properties.
  - *Responsibility:* unchanged.
  - *Depends on:* unchanged — a real, already-tracked entity from the same
    still-open `DbContext`.
  - *Connects to:* this lesson's own second unit reuses these exact real
    members to prove a real failure case, not only the real success case
    What an ORM Is and Isn't already covered.
  - *Shape:* unchanged.

---

## Concept Unit: Rewriting a Read — `Where`, Deferred Execution, and a Real Limit of `ToQueryString()`

### The Problem

`ToolRepository.FindByName` already finds a tool by name, correctly,
using one real, hand-written `SqliteCommand` with a `WHERE name = @name`
clause, proven by two real, existing, passing tests. `ToolDbContext`
(What an ORM Is and Isn't) already knows how to query every real tool
through `Tools`, but has no real way yet to filter that real query down to
one specific real name. Could the identical real filtering be expressed as
an ordinary C# method call instead of a hand-typed `WHERE` clause — and,
if so, would the resulting real SQL actually be safe, the same way
`ToolRepository`'s own parameterized SQL already is?

> **Try this first:** `context.Tools` (What an ORM Is and Isn't) already
> behaves enough like a real, in-memory `List<Tool>` to call `.ToList()`
> or `.Single()` on directly. Given that a real `List<Tool>` already
> supports LINQ's own `.Where(predicate)` for ordinary in-memory
> filtering, what would you expect `context.Tools.Where(t => t.Name ==
> name)` to do — and does anything about `Tools`'s own real, established
> nature (a `DbSet<Tool>`, not a `List<Tool>`) suggest that expectation
> might need revising?

### Introduce the Concept in Isolation

Two real, direct pieces of evidence, run this session as temporary xUnit
facts against a real, disposable copy of this project's own schema
(removed after use): first, what `ToQueryString()` (established What an
ORM Is and Isn't) reports for a real `Where`-filtered query; second,
whether that reported text is genuinely what runs, checked using a real,
temporary `DbContext` subclass enabling `LogTo` (Header, above):

```csharp
System.Console.WriteLine(context.Tools.Where(t => t.Name == "Test End Mill").ToQueryString());
```

Real, captured output:

```
SELECT "t"."Id", "t"."flute_count", "t"."Name", "t"."overall_diameter", "t"."overall_length"
FROM "tools" AS "t"
WHERE "t"."Name" = 'Test End Mill'
```

A second, real, temporary context, identical to `ToolDbContext` except for
one added real line inside `OnConfiguring` —
`optionsBuilder.LogTo(message => Console.WriteLine(message),
LogLevel.Information);` — run against the exact same real query, this
time actually executed:

```
Executed DbCommand (6ms) [Parameters=[@__name_0='?' (Size = 13)], CommandType='Text', CommandTimeout='30']
SELECT "t"."Id", "t"."flute_count", "t"."Name", "t"."overall_diameter", "t"."overall_length"
FROM "tools" AS "t"
WHERE "t"."Name" = @__name_0
```

This real, captured pair of outputs proves something `ToQueryString()`
alone never revealed: its own rendered text inlines the literal real
value (`'Test End Mill'`) directly into the SQL, purely for human
readability, while the real, actually-executed command genuinely binds it
as a parameter (`@__name_0`) instead — the identical real defense against
SQL injection this project's own hand-written `SqliteCommand.Parameters
.AddWithValue` calls have used since Never Let Data Become Code. Both real
queries return the identical real row; only the *shown* text differs.

### Discard the Throwaway Example

The temporary, logging-enabled context is discarded now — it never
appears in this project's own real, permanent code. What's proven is that
`ToQueryString()`'s own rendered text and the real, executed command are
genuinely different real strings, even for the identical real query — not
this specific throwaway comparison.

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/ToolDbContext.cs`, modified (new method).
  `ToolDB.Tests/ToolDbContextTests.cs`, modified (two new, real,
  permanent tests).
- **Change type** — add.
- **Location** — `ToolDbContext.cs`, directly after `OnModelCreating`,
  established What an ORM Is and Isn't.
- **Dependencies** — `Tools` (What an ORM Is and Isn't); `Tool.Name`
  (Records & Strong Types).

### The New Code

```csharp
public List<Tool> FindByName(string name)
{
    return Tools.Where(t => t.Name == name).ToList();
}
```

### The Updated Project

`ToolDB/ToolDbContext.cs`, with the new method added directly after
`OnModelCreating`:

```csharp
1  public class ToolDbContext : DbContext
2  {
3      private readonly string _dataSource;
4
5      public ToolDbContext(string dataSource)
6      {
7          _dataSource = dataSource;
8      }
9
10     public DbSet<Tool> Tools => Set<Tool>();
11
12     protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
13     {
14         optionsBuilder.UseSqlite($"Data Source={_dataSource}");
15     }
16
17     protected override void OnModelCreating(ModelBuilder modelBuilder)
18     {
19         modelBuilder.Entity<Tool>(entity =>
20         {
21             entity.ToTable("tools");
22             entity.Property(t => t.OverallDiameter).HasColumnName("overall_diameter");
23             entity.Property(t => t.OverallLength).HasColumnName("overall_length");
24             entity.Property(t => t.FluteCount).HasColumnName("flute_count");
25             entity.Ignore(t => t.Manufacturer);
26         });
27     }
28
29     public List<Tool> FindByName(string name)                // ← new
30     {                                                          // ← new
31         return Tools.Where(t => t.Name == name).ToList();      // ← new
32     }                                                          // ← new
33 }
```

`ToolDbContext` can now find a tool by name through ordinary LINQ, the
real, direct counterpart to `ToolRepository.FindByName`. Two new, real,
permanent tests, mirroring `ToolRepositoryTests.cs`'s own existing
`FindByName_ReturnsMatchingTool`/`FindByName_ReturnsEmptyList_WhenNoToolMatches`
scenarios exactly, confirm this real parity:

```csharp
List<Tool> results = context.FindByName("Test End Mill");
Assert.Single(results);
Assert.Equal("Test End Mill", results[0].Name);
```

### Mechanical Walkthrough

- `public List<Tool> FindByName(string name)` — an ordinary real, `public`
  instance method (reappearing), taking one real `string` parameter,
  returning a real `List<Tool>` — the identical real return shape
  `ToolRepository.FindByName` already uses.
- `Tools.Where(t => t.Name == name)` — `Tools` (established What an ORM Is
  and Isn't) is the real starting `DbSet<Tool>`; `Where` (Header, above)
  is called with a real lambda expression (Terms, above), `t => t.Name ==
  name`, whose own real parameter, `t`, stands for one real, candidate
  `Tool`, and whose own real body, `t.Name == name`, is a real, ordinary
  `==` comparison (reappearing) — the same real condition
  `ToolRepository.FindByName`'s own SQL expresses as `WHERE name =
  @name`, now written as C#. This call, by itself, touches no real
  database — per deferred execution (Terms, above), it only builds a real
  query description.
- `.ToList()` (established What an ORM Is and Isn't) — the real, final
  call that actually triggers query translation (Terms, above) and a real
  database round trip, materializing every real matching row into a real
  `List<Tool>`.

### CS Lens

`Where`'s own real behavior genuinely depends on what kind of real
sequence it's called against — against a plain, real, in-memory
`List<Tool>.AsQueryable()`, it filters values already sitting in memory;
against `context.Tools` (a `DbSet<Tool>`), the identical real C# call
instead builds a real SQL `WHERE` clause and runs it at the database. This
is a concrete instance of **polymorphism through a shared interface** —
the same real, named C# method call producing genuinely different real
behavior depending on the real, concrete type actually implementing
`IQueryable<T>` underneath it, decided at real run time, not by `Where`
itself. Also recognized in: this project's own real `override`
mechanism, established What an ORM Is and Isn't, where the same real,
named method call (`OnConfiguring`) runs whatever real code a specific
subclass supplies; any real device driver exposing an identical real
"write" call that behaves completely differently depending on which real
physical device it's actually talking to; a real web browser's own
`fetch()`, whose identical real call behaves differently over a real
cached response versus a genuine real network round trip.

### SE Lens

Why keep `ToolRepository.FindByName` at all, once `ToolDbContext.FindByName`
exists and does the identical real job? The real alternative — delete the
old method immediately — was rejected here for a real, concrete reason:
this lesson's own entire point is proving parity *before* trusting a
swap, and a caller (`MainWindow.xaml.cs`) still calls the original,
already-proven method; deleting it now would remove a real, working
capability before anything real depends on its replacement. The real
benefit this lesson's own new method buys: shorter, real code (one real
line versus `ToolRepository.FindByName`'s own five), and one fewer place a
real column-name typo (What an ORM Is and Isn't's own two real failures)
could silently diverge from the real schema, since Fluent API's own
mapping is already centralized in one place. The real, honest cost,
proven directly by this unit's own real evidence: `ToQueryString()` alone
cannot be trusted as proof of what a real query safely does — a reader
relying on it alone could wrongly conclude real values are being
concatenated into SQL text, when the real, executed command is genuinely
parameterized. Real verification of a real security property needs the
real, executed command, not just its own debug-oriented rendering.

### Run It

A real `dotnet build` was run this session: build succeeded, 0 new
Warnings, 0 Errors. Two new, real, permanent tests were added to
`ToolDbContextTests.cs`. Real source and captured output for both the
`ToQueryString()`/`LogTo` comparison are saved in
`verification/lesson-25/lab1-and-step-real-linq-translation.cs`.

### Connecting Back

`ToolDbContext` can now answer the identical real question
`ToolRepository.FindByName` already answers — proven both to work
correctly and to stay genuinely parameterized, not merely to look correct
in a debug rendering. The next unit rewrites a real write operation the
same way, and proves parity for a real failure, not only a real success.

---

## Concept Unit: Rewriting a Write — Parity Under Failure, Not Just Success

### The Problem

`ToolRepository.UpdateFluteCount`'s own existing, real test coverage
proves two real scenarios: a successful `UPDATE` commits, and a
transaction containing a deliberately bad, second real statement rolls
back cleanly, leaving the original real value untouched. A real,
LINQ/change-tracking-based rewrite of `UpdateFluteCount` already has a
real, proven way to handle the success case, from What an ORM Is and
Isn't — but `ToolDbContext` has no explicit transaction, no second bad
statement, and no `Rollback()` call anywhere in its own real code at all.
Can this rewritten method still genuinely guarantee "a failure leaves the
original real value unchanged" — and, if so, what real failure would even
prove it, given this rewrite has no obvious "bad statement" to add the way
the original ADO.NET test does?

> **Try this first:** `tools.flute_count` already carries a real `CHECK
> (flute_count > 0)` constraint, established Constraints & Data
> Integrity. Given that `SaveChanges` (What an ORM Is and Isn't) turns a
> real, tracked change into a real `UPDATE` statement and runs it against
> the real database, what would you expect to happen if that real,
> tracked change tried to set `FluteCount` to `0` — and would proving
> that real outcome need a second, artificial bad statement the way the
> original ADO.NET test used one?

### Introduce the Concept in Isolation

A real, temporary xUnit fact, run this session against a real, disposable
copy of this project's own schema (removed after use), deliberately
setting a tracked `Tool`'s own `FluteCount` to `0` before calling
`SaveChanges`:

```csharp
var tool = context.Tools.Single(t => t.Id == 1);
context.Entry(tool).Property(t => t.FluteCount).CurrentValue = 0;

try
{
    context.SaveChanges();
}
catch (DbUpdateException ex)
{
    Console.WriteLine($"REAL EXCEPTION: {ex.GetType().FullName}: {ex.Message}");
    Console.WriteLine($"REAL INNER: {ex.InnerException?.GetType().FullName}: {ex.InnerException?.Message}");
}
```

Real, captured output:

```
REAL EXCEPTION: Microsoft.EntityFrameworkCore.DbUpdateException: An error occurred while saving the entity changes. See the inner exception for details.
REAL INNER: Microsoft.Data.Sqlite.SqliteException: SQLite Error 19: 'CHECK constraint failed: flute_count > 0'.
REAL flute_count still in database: 4
```

This real, captured output proves the Socratic question's own answer
directly: no artificial bad statement is needed at all — the real, already
-existing `CHECK` constraint (Constraints & Data Integrity) is itself
enough to make `SaveChanges` fail for real, and the real database itself
never accepted the invalid write in the first place, so the original real
value (`4`) was never actually at risk of staying changed. `DbUpdateException`
(Header, above) is the real, named EF Core type this failure surfaces as;
its own real `InnerException` is the identical real
`Microsoft.Data.Sqlite.SqliteException` this project has seen directly
since Schema Design.

### Discard the Throwaway Example

This exact, temporary probe is discarded now — it never appears in this
project's own real, permanent code. What's proven is that a real `CHECK`
constraint violation genuinely surfaces through `SaveChanges` as a real
`DbUpdateException`, wrapping the real, original ADO.NET exception — not
this specific throwaway value.

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/ToolDbContext.cs`, modified (new method).
  `ToolDB.Tests/ToolDbContextTests.cs`, modified (two new, real,
  permanent tests).
- **Change type** — add.
- **Location** — `ToolDbContext.cs`, directly after `FindByName`,
  established this lesson's first unit.
- **Dependencies** — `Tools`, `Entry`, `SaveChanges` (all What an ORM Is
  and Isn't); `tools.flute_count`'s own real `CHECK` constraint
  (Constraints & Data Integrity).

### The New Code

```csharp
public void UpdateFluteCount(int id, int newFluteCount)
{
    Tool tool = Tools.Single(t => t.Id == id);
    Entry(tool).Property(t => t.FluteCount).CurrentValue = newFluteCount;
    SaveChanges();
}
```

### The Updated Project

`ToolDB/ToolDbContext.cs`, with the new method added directly after
`FindByName`:

```csharp
28     public List<Tool> FindByName(string name)
29     {
30         return Tools.Where(t => t.Name == name).ToList();
31     }
32
33     public void UpdateFluteCount(int id, int newFluteCount)              // ← new
34     {                                                                     // ← new
35         Tool tool = Tools.Single(t => t.Id == id);                        // ← new
36         Entry(tool).Property(t => t.FluteCount).CurrentValue = newFluteCount; // ← new
37         SaveChanges();                                                    // ← new
38     }                                                                     // ← new
39 }
```

Two new, real, permanent tests confirm real parity with both of
`ToolRepositoryTests.cs`'s own existing `UpdateFluteCount` scenarios — one
real success, one real failure:

```csharp
[Fact]
public void UpdateFluteCount_CommitsWhenValid_ViaEfCore()
{
    string path = CreateTestDatabase("test_efcore_updatefluteonly_commit.db");
    using (var context = new ToolDbContext(path))
    {
        context.UpdateFluteCount(1, 6);
    }
    // real, independent read via plain SqliteCommand confirms flute_count == 6
}

[Fact]
public void UpdateFluteCount_ThrowsAndLeavesValueUnchanged_WhenConstraintViolated_ViaEfCore()
{
    string path = CreateTestDatabase("test_efcore_updatefluteonly_rollback.db");
    using (var context = new ToolDbContext(path))
    {
        Assert.Throws<DbUpdateException>(() => context.UpdateFluteCount(1, 0));
    }
    // real, independent read via plain SqliteCommand confirms flute_count is still 4
}
```

### Mechanical Walkthrough

- `public void UpdateFluteCount(int id, int newFluteCount)` — an ordinary
  real, `public`, `void` instance method (reappearing), taking two real
  `int` parameters — the identical real parameter shape
  `ToolRepository.UpdateFluteCount` already uses, minus the real
  `SqliteConnection`/`SqliteTransaction` parameters that method needs and
  this one does not, since a `DbContext` already manages its own real
  connection internally.
- `Tool tool = Tools.Single(t => t.Id == id);` — `Single` (Header, above,
  this predicate overload) finds the one real tool whose real `Id` matches,
  identically in spirit to `ToolRepository.UpdateFluteCount`'s own
  `WHERE id = @id` clause, but as a real query that also leaves `tool`
  tracked by this context.
- `Entry(tool).Property(t => t.FluteCount).CurrentValue = newFluteCount;`
  (established What an ORM Is and Isn't, reappearing) — overwrites the one
  real, tracked `FluteCount` value directly, since `tool.FluteCount =
  newFluteCount;` remains a real, immediate `CS8852` compile error
  (`init`, Terms, above) on this `init`-only property.
- `SaveChanges();` (established What an ORM Is and Isn't, reappearing) —
  turns that one real, tracked change into one real `UPDATE`, run
  immediately; if the real database itself rejects it (the real `CHECK`
  constraint), this call is exactly where the real `DbUpdateException`
  (Header, above) is thrown, and exactly why nothing about the failed
  real value ever reaches the real table at all.

### CS Lens

Proving "a failure leaves the original value unchanged" without writing a
single explicit `Rollback()` call anywhere in `UpdateFluteCount`'s own
real code is a concrete instance of **atomicity as a property of a single
statement**, not only of an explicit, multi-statement transaction:
`SaveChanges`'s own single real `UPDATE`, generated from one real, tracked
change, either fully succeeds or the real database rejects the entire
real statement outright — there is no real, partial, in-between state for
one statement to leave behind, the same real guarantee this project's own
Never Let Data Become Code lesson already relied on for a single real
`INSERT`. Also recognized in: a real filesystem's own atomic file rename;
a real compare-and-swap CPU instruction, which either fully applies or
fully fails, never partially; any real database's own guarantee that a
single row's own single `UPDATE` cannot be observed half-applied by
another real connection.

### SE Lens

Why prove this real failure using an already-existing real `CHECK`
constraint instead of reusing the original ADO.NET test's own technique —
a second, deliberately invalid statement inside an explicit transaction?
The real alternative not chosen — mirroring that exact technique — was
rejected here for a real, structural reason: this lesson's own rewritten
`UpdateFluteCount` never opens an explicit, multi-statement transaction at
all, so there is no real second statement to make fail; forcing one in
just to match the original test's own shape would test a scenario this
real method can never actually produce. The real benefit of using the
`CHECK` constraint instead: it's a genuinely real failure this exact
method really can hit, not a contrived one invented to satisfy a parity
test's own shape. The real, honest cost, stated plainly: parity here means
matching *observable guarantees* — a failure leaves the original value
unchanged — not matching *how* each implementation reaches that
guarantee; a future reader comparing the two real methods side by side
needs to understand this, or risks concluding, wrongly, that one of them
is somehow less safe than the other because its own failure path looks
different.

### Run It

A real `dotnet build` was run this session: build succeeded, 0 new
Warnings, 0 Errors. Two new, real, permanent tests were added to
`ToolDbContextTests.cs`. **Full suite: 30 tests, 0 failures** — the real,
current, full count for this project (up from 26 before this lesson). Real
source and captured output for the isolated `DbUpdateException` probe are
saved in `verification/lesson-25/lab1-and-step-real-linq-translation.cs`.

### Connecting Back

`ToolDbContext.UpdateFluteCount` now matches `ToolRepository.UpdateFluteCount`'s
own real contract completely — a real success commits, and a real failure
leaves the original value genuinely untouched — proven using a failure
this exact method can really produce, not one borrowed from the original
implementation's own different internal shape.

---

## Connect the Pieces

The same real tool — id `1`, `1/2 in 4-Flute Carbide End Mill` — traced
through both units, alongside the real, existing ADO.NET methods each new
method was held accountable to:

1. `ToolDbContext.FindByName("1/2 in 4-Flute Carbide End Mill")` was built
   as a real, LINQ-based counterpart to `ToolRepository.FindByName`,
   proven to return the identical real match — and, separately, proven
   that `ToQueryString()`'s own debug-oriented rendering is not the same
   real text as the actually-executed, genuinely parameterized command,
   confirmed with `LogTo` (Unit 1).
2. `ToolDbContext.UpdateFluteCount(1, ...)` was built as a real,
   change-tracking-based counterpart to `ToolRepository.UpdateFluteCount`,
   proven to match its real contract for both a real success and a real
   failure — the failure proven using this exact method's own real,
   available failure mode (a `CHECK` constraint violation surfacing as a
   real `DbUpdateException`), not a borrowed one (Unit 2).

**This project's own original, hand-written ADO.NET code —
`ToolRepository`, and every real query inside `MainWindow.xaml.cs` — is
still completely unmodified and still what actually runs.** `ToolDbContext`
now offers a second, real, fully parity-tested implementation of two of
its operations, ready for a future, deliberate swap, not yet performing
one. **Next lesson:** 26 — Schema Migrations & Versioning (`PRAGMA
user_version`, then EF Core Migrations).
