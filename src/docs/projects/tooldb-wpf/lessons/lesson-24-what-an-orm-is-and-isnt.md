# Lesson 24: What an ORM Is and Isn't (EF Core, `DbContext`, Mapping a Table to a Class)

**What you will build.** A new, real, permanent class, `ToolDbContext`, added
alongside this project's own existing, unmodified ADO.NET code
(`ToolRepository`, `MainWindow.xaml.cs`) — not replacing it yet. Querying
`ToolDbContext.Tools` reaches the exact same real `tools` table this
project's own hand-written SQL already reads, through Entity Framework
Core (EF Core) instead of a hand-written `SqliteCommand`. The transferable
problem underneath the feature: an ORM (object-relational mapper) lets C#
code describe *what* rows it wants as ordinary objects and lets a library
generate the real SQL, instead of a person hand-writing that SQL for every
operation — but, as this lesson's own two real, captured failures prove
directly, that mapping is never automatic or magical; it has to be told,
explicitly, exactly how each real column corresponds to each real C#
property, or it fails at the database, for real, the same way a
hand-written `SqliteCommand` with the wrong column name would.

**What you need to know first.** Connecting to a Database File — the real
connection-string convention (`Data Source=...`) this lesson's own
`OnConfiguring` reuses. Querying Back — the real `SELECT`/row-mapping shape
this lesson's own EF Core query replaces conceptually, side-by-side, not by
deletion. Records & Strong Types — `Tool`'s own real `record` shape with
`init`-only properties, directly responsible for this lesson's own third
unit needing a real, non-obvious mutation technique. Multiple Tables &
`JOIN` — the real reason `Tool.Manufacturer` is not, and cannot be, an
ordinary column on the real `tools` table this lesson maps to.

**Terms used in this lesson**

- **ORM (object-relational mapper)** — a library that lets application code
  work with real database rows as ordinary objects, generating real SQL
  behind the scenes instead of a person writing it by hand for every
  operation. It exists to remove repetitive, error-prone hand-written SQL
  for common operations — not to remove the need to understand SQL, which
  this lesson's own two real failures prove directly by showing exactly
  where that removal stops being safe.
- **convention** — an ORM's own built-in default guess about how a C#
  construct maps to a database construct, applied automatically with zero
  configuration. Per Microsoft's own real, fetched documentation
  (`learn.microsoft.com/ef/core/modeling/`), "EF Core uses a metadata
  *model* to describe how the application's entity types are mapped to the
  underlying database. This model is built using a set of *conventions* -
  heuristics that look for common patterns." It exists so that the common
  case (a C# property name that already matches its real column name)
  needs zero extra code — but, as this lesson's own first real failure
  proves, a convention is a guess, not a guarantee.
- **Fluent API** — a specific, real way to override a wrong or incomplete
  convention: calling real, chainable configuration methods inside a
  `DbContext`'s own `OnModelCreating` method, rather than editing the
  entity class itself. Per that same real, fetched documentation, "This is
  the most powerful method of configuration and allows configuration to be
  specified without modifying your entity classes." It exists so that
  ORM-specific mapping knowledge can live in one place (the `DbContext`),
  never scattered into a domain class like `Tool` that has no reason to
  know an ORM exists at all.
- **LINQ (Language Integrated Query)** — a real C# feature, first used in
  this lesson, that lets ordinary C# method calls (`.ToList()`, `.Single()`,
  and others this lesson doesn't yet use, like `.Where()`) describe a query
  against any real, queryable source — a plain in-memory list, or, as this
  lesson's own real code proves, a real database table through EF Core. It
  exists so the same real query syntax works whether the underlying data
  is already in memory or has to be fetched first — the mechanism Lesson
  25 ("Rewriting Your Queries Through EF Core") uses to replace this
  project's own hand-written `SELECT` statements.
- **`readonly`** — a real C# field modifier, first used in this lesson. A
  field marked `readonly` can only be assigned inside its own declaration
  or inside the constructor of the class that declares it; any other
  assignment anywhere else in the class is a real compile error. It exists
  to make a promise checkable by the compiler, not just by convention:
  once a `ToolDbContext` is constructed, nothing later in its own code can
  silently repoint `_dataSource` at a different real file.
- **`protected`** — a real C# access modifier, first used in this lesson.
  A `protected` member is visible to the class that declares it and to any
  real subclass of that class, but to nothing else outside that
  relationship — a real, third visibility level, distinct from both
  `public` (visible everywhere) and `private` (visible only inside the
  declaring class itself). It exists so a base class like `DbContext` can
  expose real extension points meant only for a subclass like
  `ToolDbContext` to use, without exposing those same members to
  unrelated, ordinary calling code.
- **`override`** — a real C# keyword, first used in this lesson. It marks
  a subclass's own real method as replacing a specific base class method
  the base class itself already marked `virtual` (or, as with
  `OnConfiguring`/`OnModelCreating` below, provided a real, empty default
  body for) — so that when the base class's own code calls that method on
  itself, the subclass's real version runs instead, a real mechanism
  called **polymorphic dispatch**. It exists so a framework's own code
  (here, `DbContext`'s own internal logic) can call a fixed, named method
  at a moment *it* decides, while still running whatever real code a
  specific subclass supplied — the same real "the framework calls you"
  relationship this project's own WPF `Loaded` event already established,
  now expressed through inheritance instead of an event subscription.
- **change tracking** — a real `DbContext` mechanism, central to this
  lesson's own third unit: once a real entity is returned from a query, the
  same `DbContext` instance keeps watching it, and `SaveChanges` compares
  its current values against the values it had when queried to decide what,
  if anything, actually needs writing back to the database. Per Microsoft's
  own real, fetched documentation (`learn.microsoft.com/ef/core/change-tracking/`),
  "Each DbContext instance tracks changes made to entities. These tracked
  entities in turn drive the changes to the database when SaveChanges is
  called." It exists so a caller never has to write its own by-hand "did
  this actually change" check before an `UPDATE` — the ORM already knows.
- **`init`** — reappearing, established when `Tool` was converted from a
  mutable `class` to an immutable `record` with `init`-only properties. A
  property declared `{ get; init; }` can only be assigned inside an object
  initializer at construction time (`new Tool { Name = "..." }`); any
  assignment anywhere else, on an already-constructed instance, is a real
  compile error. It reappears here because it is the exact reason this
  lesson's own third unit cannot simply write `tool.FluteCount = 6;` after
  querying a `Tool` back from `ToolDbContext` — the identical real
  restriction Records & Strong Types' own aliasing-safety guarantee depends
  on.
- **`CS8852`** — reappearing, the exact real compiler error `init` (above)
  produces when violated: "Init-only property or indexer can only be
  assigned in an object initializer." It reappears here as the real,
  concrete reason this lesson's own third unit has to reach for a
  different, real mechanism (`EntityEntry.Property(...).CurrentValue`)
  instead of ordinary property assignment.
- **`record`** — reappearing, established the same session as `init`
  above: a real C# type category built around value semantics rather than
  identity, with a compiler-synthesized `Equals`/`ToString`. It reappears
  here because `Tool` — the real type this lesson's own `ToolDbContext`
  maps — is one, and because this lesson's own second, isolated `Gadget`
  lab is deliberately built as one too, to prove change tracking's own
  real mechanism against the identical shape before trusting it against
  the real project's own `Tool`.
- **`=>` (expression-bodied member)** — reappearing, established on
  `AboutViewModel`'s own `ToolCountMessage` property. A member body written
  as `=> expression;` instead of a full `{ get { return expression; } }`
  block — pure syntax sugar; the compiler produces the identical real
  member either way. It reappears here on `ToolDbContext.Tools`, which
  computes its value fresh on every access rather than storing it in a
  field, the same real shape `ToolCountMessage` already used.
- **`$"..."` (string interpolation)** — reappearing, established early in
  this project. A string literal prefixed with `$` that evaluates
  `{expression}` placeholders directly inside it at run time. It reappears
  here inside `OnConfiguring`, building a real SQLite connection string
  from whatever real file path `ToolDbContext` was constructed with.

**Objects and methods used**

- **`DbContext`**
  - *What it is:* the real EF Core base class every real, application-
    specific database context — including this lesson's own `ToolDbContext`
    — derives from.
  - *Implementation:* `public class DbContext : ...` (`Microsoft.EntityFrameworkCore`
    namespace). Per Microsoft's own real, fetched API documentation
    (`learn.microsoft.com/dotnet/api/microsoft.entityframeworkcore.dbcontext`),
    "A DbContext instance represents a session with the database and can be
    used to query and save instances of your entities. DbContext is a
    combination of the Unit Of Work and Repository patterns." Its own real
    Remarks add a genuinely load-bearing constraint this lesson's own code
    already respects by using one short-lived instance per operation: "Entity
    Framework Core does not support multiple parallel operations being run
    on the same DbContext instance."
  - *Its use:* the real base class `ToolDbContext` derives from to gain real
    querying, change tracking, and saving behavior for free, rather than
    reimplementing any of it by hand.
  - *Type:* an abstract-in-practice base class — never instantiated
    directly in real code; always through a real, application-specific
    subclass.
  - *Responsibility:* represent one real, short-lived "session" with the
    database — track which real entities have been queried or added, know
    which of their real values changed, and turn that tracked real state
    into real `INSERT`/`UPDATE`/`DELETE` statements when asked.
  - *Depends on:* a real database provider (this project's own
    `Microsoft.EntityFrameworkCore.Sqlite` package) and real configuration —
    supplied here through `OnConfiguring`, below — telling it which real
    database to open.
  - *Connects to:* subclassed by `ToolDbContext`; its own real `Tools`
    property, `Entry`, `ChangeTracker`, and `SaveChanges` members (all
    below) are all inherited directly from it, unmodified.
  - *Shape:* the real seam between ordinary C# code and EF Core's own real
    internal machinery — every EF Core feature this project uses from here
    forward reaches it through some real member of this one class.

- **`ToolDbContext`**
  - *What it is:* a new, real, permanent class this lesson adds — this
    project's own first application-specific `DbContext` subclass.
  - *Implementation:* `public class ToolDbContext : DbContext` — a real
    constructor, `public ToolDbContext(string dataSource)`, storing its
    argument in a real `private readonly string _dataSource` field; a real
    `DbSet<Tool> Tools` property; a real, overridden `OnConfiguring`; and,
    from this lesson's second unit on, a real, overridden `OnModelCreating`
    (both below).
  - *Its use:* the one real, concrete object this lesson's own three units
    build up, unit by unit, into a working, mapped, change-tracked path to
    the real `tools` table.
  - *Type:* an ordinary, real, concrete class — no static members, one real
    instance created per operation, matching this project's own existing
    `SqliteConnection`-per-operation convention.
  - *Responsibility:* represent this project's own real `tools` table as a
    real, queryable, change-tracked C# collection (`Tools`), configured to
    point at whichever real SQLite file it was constructed with.
  - *Depends on:* a real `dataSource` string supplied by its own caller (a
    real file path, or, as this lesson's own tests use, a real disposable
    temp-file path) — deliberately not hardcoded, so a real test never
    touches this project's own real, live `tools.db`.
  - *Connects to:* constructed directly by this lesson's own two new,
    real, permanent tests (`ToolDB.Tests/ToolDbContextTests.cs`); not yet
    constructed anywhere inside `MainWindow.xaml.cs` or `ToolRepository` —
    that real wiring belongs to this project's own next real step —
    rewriting its existing queries through EF Core — not to this lesson.
  - *Shape:* a new, real, second persistence-layer entry point, standing
    directly alongside — never yet replacing — this project's own existing
    ADO.NET entry points (`ToolRepository`, and the raw `SqliteCommand`
    calls inside `MainWindow.xaml.cs`).

- **`DbSet<TEntity>` / `DbContext.Set<TEntity>()`**
  - *What it is:* `DbSet<TEntity>` is the real, generic EF Core class
    representing one real, queryable table of a given real entity type;
    `Set<TEntity>()` is the real, protected `DbContext` method that
    produces one.
  - *Implementation:* per Microsoft's own real, fetched API documentation
    (`learn.microsoft.com/dotnet/api/microsoft.entityframeworkcore.dbset-1`),
    "A DbSet\<TEntity\> can be used to query and save instances of
    TEntity. LINQ queries against a DbSet\<TEntity\> will be translated
    into queries against the database" — and its own real declared shape
    implements `IEnumerable<TEntity>` and `IQueryable<TEntity>` directly,
    which is exactly what makes real LINQ methods like `.ToList()` and
    `.Single()` (below) callable on it at all. `Set<Tool>()` is called
    once, inside `ToolDbContext.Tools`'s own real body.
  - *Its use:* `ToolDbContext.Tools` is this lesson's own real, concrete
    `DbSet<Tool>` — the one real object every query in this lesson
    ultimately runs against.
  - *Type:* `DbSet<TEntity>` is a real, generic, abstract class;
    `Set<TEntity>()` is a real, protected, generic instance method
    inherited from `DbContext`.
  - *Responsibility:* stand in for "the whole real `tools` table, as a C#
    collection" — translating real LINQ calls made against it into real
    SQL, and handing back real, mapped `Tool` instances.
  - *Depends on:* the real EF Core model built by `OnModelCreating` (this
    lesson's second unit) to know which real table and columns it actually
    corresponds to.
  - *Connects to:* produced once per `ToolDbContext` instance by
    `Set<Tool>()`; consumed directly by `.ToList()`/`.Single()`/`.ToQueryString()`
    (below) everywhere this lesson queries it.
  - *Shape:* the real, public entry point a caller actually touches —
    `OnConfiguring`/`OnModelCreating` are configuration a caller never
    calls directly.

- **`DbContext.OnConfiguring(DbContextOptionsBuilder)` / `UseSqlite(string)`**
  - *What it is:* `OnConfiguring` is a real, `protected`, `virtual`
    `DbContext` method with an empty real default body, meant to be
    overridden to supply real database connection configuration.
    `UseSqlite` is a real, `Microsoft.EntityFrameworkCore.Sqlite` extension
    method on `DbContextOptionsBuilder` that configures the SQLite
    provider with a real connection string.
  - *Implementation:* `protected override void OnConfiguring(DbContextOptionsBuilder
    optionsBuilder)`, calling `optionsBuilder.UseSqlite($"Data Source={_dataSource}")`
    — the identical real `Data Source=...` connection-string shape this
    project's own `SqliteConnection` calls have used since this project's
    very first lesson.
  - *Its use:* the one real place `ToolDbContext` says which real SQLite
    file it talks to — called automatically by `DbContext`'s own internal
    code the first time this context is actually used, never called
    directly by this lesson's own code.
  - *Type:* `OnConfiguring` is a `protected`, `virtual`, real instance
    method (overridden here per `override`, above); `UseSqlite` is a
    `public`, `static` extension method.
  - *Responsibility:* `OnConfiguring`'s full real charter is supplying
    whatever real configuration (provider, connection string, and options
    this lesson doesn't yet use) a `DbContext` needs before it can do
    anything else at all; `UseSqlite` specifically registers the real
    SQLite provider and the real file it should open.
  - *Depends on:* `_dataSource`, this class's own real, constructor-supplied
    field.
  - *Connects to:* called by `DbContext`'s own real internal startup
    logic; its own real parameter, `optionsBuilder`, is handed back,
    already configured, to that same internal logic once this method
    returns.
  - *Shape:* a real, `protected` extension point — a framework-defined
    seam a subclass fills in, never a method application code calls
    directly.

- **`ModelBuilder` / `DbContext.OnModelCreating(ModelBuilder)` / `EntityTypeBuilder<TEntity>`**
  - *What it is:* `OnModelCreating` is a second real, `protected`,
    `virtual` `DbContext` method, called once, meant to be overridden to
    configure how entity classes map onto real database tables and
    columns. `ModelBuilder` is the real object it receives; calling
    `.Entity<TEntity>()` on it returns a real `EntityTypeBuilder<TEntity>`,
    whose own real, chainable members this lesson's second unit uses to
    fix a real convention mismatch.
  - *Implementation:* `protected override void OnModelCreating(ModelBuilder
    modelBuilder)`. `EntityTypeBuilder<TEntity>`'s own real, relevant
    declared shape — verified against EF Core's own real, fetched
    documentation and source this session — is:
    ```csharp
    public class EntityTypeBuilder<TEntity> where TEntity : class
    {
        public EntityTypeBuilder<TEntity> ToTable(string name);
        public PropertyBuilder<TProperty> Property<TProperty>(Expression<Func<TEntity, TProperty>> propertyExpression);
        public EntityTypeBuilder<TEntity> Ignore(Expression<Func<TEntity, object?>> propertyExpression);
    }
    ```
  - *Its use:* the real, concrete mechanism this lesson's second unit uses
    to tell EF Core exactly which real column each of `Tool`'s real
    properties corresponds to, and that `Manufacturer` corresponds to no
    real column at all.
  - *Type:* both `OnModelCreating` and `ToTable`/`Ignore` are real instance
    methods; `Property<TProperty>` is a real, generic instance method.
  - *Responsibility:* `OnModelCreating`'s full real charter is building the
    complete real mapping between every entity class this context exposes
    and the real database schema those entities correspond to, once, the
    first time it's needed; `EntityTypeBuilder<TEntity>`'s own real charter
    is collecting, for one specific entity type, every piece of that real
    mapping information a caller supplies through it.
  - *Depends on:* `Tool`'s own real, already-declared properties (`.Property(t
    => t.OverallDiameter)` reads an existing real property via a real
    lambda expression, the identical real construct already established by
    this project's own `RelayCommand` bindings and its own
    `JsonSerializer.Deserialize<EditRequest>` call — it does not create a
    new one).
  - *Connects to:* called once by `DbContext`'s own real internal startup
    logic, the same real timing category as `OnConfiguring`; its own real
    configuration is consumed internally to build the real model
    `DbSet<Tool>` (above) relies on for every later query.
  - *Shape:* a second real, `protected` extension point, sitting one level
    "deeper" than `OnConfiguring` — configuring the real shape of the data
    itself, not just how to reach it.

- **`EntityTypeBuilder<TEntity>.Property<TProperty>(...)` → `PropertyBuilder<TProperty>.HasColumnName(string)`**
  - *What it is:* `Property<TProperty>` (shown above) returns a real,
    chained `PropertyBuilder<TProperty>`; `HasColumnName` is one real
    method on it, overriding the real column-name convention for that one
    property.
  - *Implementation:* `entity.Property(t => t.OverallDiameter).HasColumnName("overall_diameter")`
    — a real, two-link fluent chain, each link its own real method call.
  - *Its use:* the exact real fix for this lesson's own first real
    failure — telling EF Core, explicitly, that `OverallDiameter` (the C#
    property) and `overall_diameter` (the real column) are the same real
    piece of data, once for each of the three real columns whose names
    don't already match by convention (`OverallDiameter`, `OverallLength`,
    `FluteCount`).
  - *Type:* a real, generic instance method returning a real,
    generic `PropertyBuilder<TProperty>`.
  - *Responsibility:* record, for one specific real property, exactly
    which real column it corresponds to — overriding whatever the default
    naming convention would otherwise have guessed.
  - *Depends on:* an already-obtained `EntityTypeBuilder<Tool>` (from
    `.Entity<Tool>()`, above).
  - *Connects to:* called three times inside `OnModelCreating`, once per
    real mismatched column; its own real effect is read back later by
    every real query `DbSet<Tool>` runs.
  - *Shape:* part of the same real Fluent API configuration surface as
    `ToTable`/`Ignore` — all three are real members of the same real
    `EntityTypeBuilder<Tool>`.

- **`EntityTypeBuilder<TEntity>.Ignore(...)`**
  - *What it is:* a third real member of `EntityTypeBuilder<TEntity>`
    (shown above), removing one real C# property from the model entirely.
  - *Implementation:* `entity.Ignore(t => t.Manufacturer);`.
  - *Its use:* the real, concrete answer to this lesson's own title
    question — telling EF Core that `Tool.Manufacturer` is not, and must
    never be treated as, a real column on `tools` at all, since it only
    ever exists by joining `tools` against `vendors` (Multiple Tables &
    `JOIN`).
  - *Type:* a real instance method.
  - *Responsibility:* exclude one specific real property from the entity
    model completely — that property is never read from, or written to,
    any real column by this `DbContext`, ever.
  - *Depends on:* the same already-obtained `EntityTypeBuilder<Tool>` as
    `Property`/`ToTable`.
  - *Connects to:* its real effect is proven directly in this lesson's own
    second unit — the real generated SQL for `context.Tools` stops naming
    `Manufacturer` at all, and every real `Tool` this context returns has
    `Manufacturer` sitting at its own real, ordinary default (`""`), never
    a real value read from the database.
  - *Shape:* the real, explicit boundary between "a real column this
    context manages" and "a C# property this context has been told to
    stay out of."

- **`ToQueryString()`**
  - *What it is:* a real, public EF Core extension method available on any
    real `IQueryable<T>`, including a `DbSet<TEntity>`.
  - *Implementation:* `context.Tools.ToQueryString()` returns a real
    `string` — the actual, real SQL text EF Core would send to the real
    database for that exact real query, without running it.
  - *Its use:* this lesson's own real proof, both times it's called, that
    EF Core's own generated SQL is genuinely inspectable text, not an
    opaque black box — directly demystifying what "translated into a real
    query" (`DbSet<TEntity>`, above) actually means.
  - *Type:* a real, `public`, `static` extension method.
  - *Responsibility:* render the real SQL a given real `IQueryable<T>`
    would currently produce, as plain text, without touching the real
    database at all.
  - *Depends on:* a real, already-built `IQueryable<T>` (here,
    `context.Tools`) and the real model EF Core has already assembled for
    it via `OnModelCreating`.
  - *Connects to:* called directly by this lesson's own code in both its
    first and second units, on the unmapped and then the mapped
    `ToolDbContext`, to make the real *difference* between them visible as
    real text.
  - *Shape:* a real, read-only diagnostic seam — never part of this
    project's own real, permanent runtime code, only ever used here, in
    the lesson's own real verification.

- **LINQ query execution: `ToList()` / `Single()`**
  - *What it is:* two real, standard LINQ methods, both usable on any real
    `IQueryable<T>` (`DbSet<TEntity>`, above) because `DbSet<TEntity>`
    implements that real interface directly.
  - *Implementation:* `context.Tools.ToList()` returns a real
    `List<Tool>`, containing every real row the query matches, translated
    and executed against the real database at the moment it's called.
    `context.Tools.Single()` returns exactly one real `Tool`, and throws a
    real `InvalidOperationException` if the real result has anything other
    than exactly one row.
  - *Its use:* `ToList()` proves this lesson's own first real
    convention-mismatch failure and its own real Fluent API fix, against
    the isolated `Widget` lab; `Single()` is used throughout this lesson's
    own real, permanent tests, since each real test database this lesson
    seeds holds exactly one real tool.
  - *Type:* real, generic `static` extension methods (from
    `System.Linq`), not instance methods of `DbSet<TEntity>` itself.
  - *Responsibility:* actually run the real, translated SQL query and
    materialize its real results into real C# objects — nothing before
    this point in either method's own real call chain has touched the
    real database at all.
  - *Depends on:* a real `IQueryable<T>` to run against, and, for
    `Single()`, a real guarantee (never enforced by the type system
    itself, only checked at real run time) that exactly one real row will
    come back.
  - *Connects to:* the real, final link in every query this lesson runs —
    called directly after `context.Tools`, with no further real chaining
    afterward.
  - *Shape:* the real boundary between "a query description" (anything
    built but not yet run) and "a real database round trip" — nothing
    before `.ToList()`/`.Single()` in this lesson's own code has actually
    touched `tools.db` yet.

- **`DbContext.Entry(TEntity)` → `EntityEntry<TEntity>.Property<TProperty>(...)` → `PropertyEntry.CurrentValue`**
  - *What it is:* `Entry` is a real, inherited `DbContext` method returning
    a real `EntityEntry<TEntity>` — a real handle onto how this context is
    currently tracking one specific, already-queried real entity.
    `Property<TProperty>` (a distinct, real overload from
    `EntityTypeBuilder<TEntity>`'s own method of the same name, above)
    returns a real `PropertyEntry<TEntity, TProperty>`; `CurrentValue` is a
    real, writable property on it.
  - *Implementation:* real, relevant declared shape, verified against EF
    Core's own real, fetched documentation and source this session:
    ```csharp
    public class EntityEntry<TEntity> where TEntity : class
    {
        public PropertyEntry<TEntity, TProperty> Property<TProperty>(Expression<Func<TEntity, TProperty>> propertyExpression);
    }

    public class PropertyEntry<TEntity, TProperty> where TEntity : class
    {
        public TProperty CurrentValue { get; set; }
    }
    ```
    Used as `context.Entry(tool).Property(t => t.FluteCount).CurrentValue = 6;`.
  - *Its use:* the real, concrete answer to this lesson's own third unit's
    central problem — a real way to change one real, tracked value on
    `tool` even though `tool.FluteCount = 6;` would be a real `CS8852`
    compile error, since `Tool.FluteCount` is `init`-only.
  - *Type:* `Entry` is a real, generic instance method; `Property` (this
    overload) is a real, generic instance method on `EntityEntry<TEntity>`;
    `CurrentValue` is a real, ordinary `{ get; set; }` property.
  - *Responsibility:* `Entry`'s full real charter is exposing this
    context's own internal tracking state for one specific real entity —
    what its values were when queried, what they are now, and what real
    state (`EntityState`, below) it's currently in;
    `Property(...).CurrentValue`'s own real charter is reading or
    overwriting exactly one specific real tracked value, bypassing the
    entity's own real C# accessors entirely.
  - *Depends on:* `tool` already being a real, tracked entity — returned
    from a real query against this same, still-open `ToolDbContext`
    instance, per this lesson's own Terms entry on **change tracking**,
    above.
  - *Connects to:* setting `CurrentValue` here is exactly what the next
    unit's own `ChangeTracker.DetectChanges()`/`DebugView` (below) reports
    back as a real, modified value, and exactly what `SaveChanges` (below)
    later writes to the real database.
  - *Shape:* a real, lower-level escape hatch beneath `DbSet<TEntity>`'s
    own ordinary querying surface — reached into directly only because
    `Tool`'s own real, immutable shape makes the ordinary path
    (`tool.FluteCount = 6;`) uncompilable.

- **`DbContext.ChangeTracker` → `ChangeTracker.DetectChanges()` / `DebugView.LongView`**
  - *What it is:* `ChangeTracker` is a real, inherited `DbContext`
    property exposing the real object responsible for this context's own
    change-tracking mechanism as a whole; `DetectChanges()` forces it to
    recompute what's actually changed right now; `DebugView.LongView` is a
    real, human-readable `string` summarizing every currently-tracked real
    entity and its real state.
  - *Implementation:* `context.ChangeTracker.DetectChanges();` followed by
    `Console.WriteLine(context.ChangeTracker.DebugView.LongView);` — real,
    relevant declared shape, verified against EF Core's own real, fetched
    documentation this session:
    ```csharp
    public class ChangeTracker
    {
        public DebugView DebugView { get; }
        public void DetectChanges();
    }

    public class DebugView
    {
        public string LongView { get; }
    }
    ```
  - *Its use:* this lesson's own real, direct proof that change tracking
    (Terms, above) is genuine, inspectable, real behavior — not an
    unverified claim about something happening "automatically" — matching
    this project's own standing demand that hidden framework behavior get
    shown, not just asserted.
  - *Type:* `ChangeTracker` is a real, `public`, read-only instance
    property; `DetectChanges()` is a real instance method; `DebugView` is a
    second real, read-only property returning a real object whose own
    `LongView` property is read directly.
  - *Responsibility:* `ChangeTracker`'s full real charter is owning every
    real entity this context currently knows about and each one's own real
    tracked state; `DetectChanges()`'s is walking every tracked real entity
    and comparing its current real property values against the values it
    had when queried; `DebugView.LongView`'s is rendering that entire real
    internal state as one readable real string, for exactly this kind of
    real inspection.
  - *Depends on:* at least one real, currently-tracked entity to have
    anything meaningful to report.
  - *Connects to:* reads the exact real change `Entry(tool).Property(...)
    .CurrentValue = 6;` (above) just made; its own real output is this
    lesson's own direct, captured evidence for that change, before
    `SaveChanges` (below) ever runs.
  - *Shape:* a real, read-only diagnostic surface — like `ToQueryString()`,
    above, never part of this project's own real, permanent runtime code,
    only ever used here to make a real, otherwise-invisible mechanism
    visible.

- **`DbContext.SaveChanges()`**
  - *What it is:* a real, inherited `DbContext` method that turns every
    real, currently-tracked change into real database statements.
  - *Implementation:* `context.SaveChanges();` — takes no arguments here,
    returns a real `int` (the real count of rows affected) this lesson's
    own code doesn't currently use.
  - *Its use:* the real, final step of this lesson's own third unit —
    turning the real, tracked `FluteCount` change `Entry(...).CurrentValue`
    made into an actual real `UPDATE` against the real database.
  - *Type:* a real, `public` instance method.
  - *Responsibility:* its full real charter is translating every real,
    currently-tracked `Added`/`Modified`/`Deleted` entity
    (`EntityState`, below) into the matching real `INSERT`/`UPDATE`/`DELETE`
    statement, run them all against the real database, and, on real
    success, mark every one of them `Unchanged` again.
  - *Depends on:* a real, open `DbContext` with at least one real, tracked
    change — calling it with nothing tracked is a real, harmless no-op.
  - *Connects to:* called once per this lesson's own second, real,
    permanent test; its own real effect is confirmed immediately
    afterward by a plain, real `SqliteCommand`/`ExecuteScalar` read —
    deliberately outside EF Core entirely, so the real proof doesn't
    depend on trusting the same library being tested.
  - *Shape:* the real, single point where every change this context has
    been tracking finally becomes a real write — nothing before this call
    in this lesson's own code has touched the real database's own writable
    state at all.

- **`EntityState`**
  - *What it is:* a real, `public` EF Core `enum`, naming every real
    lifecycle state a tracked entity can be in.
  - *Implementation:* per Microsoft's own real, fetched documentation
    (`learn.microsoft.com/ef/core/change-tracking/`), its real members are
    `Detached`, `Added`, `Unchanged`, `Modified`, and `Deleted` — this
    lesson's own real, captured `DebugView.LongView` output shows a real
    `Tool` in the real `Modified` state directly, by name.
  - *Its use:* named, not directly referenced by this lesson's own code —
    the real vocabulary `DebugView.LongView`'s own real output uses to
    describe what `DetectChanges()` found.
  - *Type:* a real, `public enum`.
  - *Responsibility:* its full real charter, per that same real
    documentation, is distinguishing exactly what `SaveChanges` will do
    with a given tracked entity: nothing (`Unchanged`), an `INSERT`
    (`Added`), an `UPDATE` (`Modified`), or a `DELETE` (`Deleted`) — a
    `Detached` entity is not tracked at all.
  - *Depends on:* nothing — a plain, real, fixed set of named values.
  - *Connects to:* assigned internally by `DbContext`'s own real tracking
    logic every time an entity is queried, added, or changed; read back,
    in this lesson, only indirectly, through `DebugView.LongView`'s own
    real rendered text.
  - *Shape:* the real, small vocabulary underneath everything this
    lesson's own third unit demonstrates — every real word `DebugView`
    prints (`Modified`, `Unchanged`) is one of these five real values.

**Everything else in the file, not this lesson's own subject but still
explained**

- **`SqliteConnection`, `SqliteCommand`, `ExecuteNonQuery()`**
  - *What it is:* reappearing — the real ADO.NET classes/method this
    project has used since its own first lesson to open a real database
    file and run real SQL text directly against it.
  - *Implementation:* unchanged from every earlier real appearance.
  - *Its use:* this lesson's own isolated `Widget`/`Gadget` labs (below)
    use all three, directly, only to build each real throwaway table
    before EF Core ever touches it — deliberately not through EF Core
    itself, since the point of each lab is to control the real schema
    precisely.
  - *Type:* real ADO.NET classes/instance method, unchanged.
  - *Responsibility:* unchanged — open a real file, run one real
    statement against it.
  - *Depends on:* a real, valid SQLite connection string.
  - *Connects to:* used only inside this lesson's own setup code, never
    inside `ToolDbContext` itself, which reaches the real database through
    EF Core's own real `Microsoft.Data.Sqlite`-based provider instead.
  - *Shape:* the same real ADO.NET seam this project has used from the
    start — sitting, in this lesson, one level "below" EF Core, used only
    to prepare real fixtures for it.

---

## Concept Unit: `DbContext` & `DbSet` — A Class That Represents a Whole Table

### The Problem

Every real query this project has written so far — inside `ToolRepository`
and `MainWindow.xaml.cs` alike — starts the same real way: construct a
`SqliteConnection`, construct a `SqliteCommand` holding real, hand-typed SQL
text naming real columns, call `ExecuteReader()`, and loop, calling
`Tool.FromReader` once per real row. That real shape works, and this
project keeps it, unmodified, for the rest of this lesson and the next —
but it means every new real query anywhere in this project requires
hand-typing real SQL text again. Could a real C# object exist that behaves
enough like an ordinary, real, in-memory collection of `Tool` that ordinary
C# code — not hand-written SQL — could ask it for rows?

> **Try this first:** this project already has a real, in-memory
> `List<Tool>` (built by hand, row by row, inside `MainWindow_Loaded`).
> Given that a `List<Tool>` already supports ordinary C# operations, what
> would a database table have to promise about itself for a real object
> representing that *table* to support those same operations directly,
> without a caller ever writing raw SQL? What real information would such
> an object need to be told before it could safely translate an ordinary
> C# call into a real SQL query — and what might go wrong if that
> real information were ever wrong or incomplete?

### Introduce the Concept in Isolation

A minimal, unrelated, real, throwaway table and its own minimal real
`DbContext` subclass, built and run in `LabScratch/Program.cs` this
session, deliberately choosing column names that already match their C#
property names — the case EF Core's own default convention (Terms, above)
handles with zero configuration:

```csharp
public class Widget
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
}

public class NaiveWidgetContext : DbContext
{
    public DbSet<Widget> Widgets => Set<Widget>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSqlite("Data Source=lab_widgets.db");
    }
}
```

Run for real this session against a real `widgets` table whose own real
column is named `widget_name` — deliberately *not* matching `Widget.Name` —
to see exactly what a wrong convention produces before this lesson's own
real project code ever risks the same mistake:

```
--- Lab 1a: generated SQL for the default, convention-mapped query (ToQueryString) ---
SELECT "w"."Id", "w"."Name"
FROM "widgets" AS "w"
--- Lab 1b: actually running the default, convention-mapped query ---
Threw: Microsoft.Data.Sqlite.SqliteException: SQLite Error 1: 'no such column: w.Name'.
```

This real, captured output proves the Socratic question's own answer
directly: `NaiveWidgetContext` never asked anything about the real table's
actual column names — it *assumed* a real column named `Name` exists,
because `Widget.Name` exists, and that real assumption was wrong. This
class, and the real convention it relies on, is called an **ORM**
(Terms, above) doing exactly what a convention (Terms, above) does: guess,
not verify.

### Discard the Throwaway Example

This exact `Widget`/`widget_name` mismatch is discarded now — it never
appears in this project again. What's proven is that EF Core's own default
convention genuinely assumes a C# property name and a real column name
match, and genuinely fails, for real, at the real database, the moment
they don't — not this specific throwaway table. (This lesson's second
unit reuses this same real `widgets` table, unmodified, to prove the real
fix — it is not yet fully discarded until then.)

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/ToolDB.csproj`, modified (new package
  reference). `ToolDB.Tests/ToolDB.Tests.csproj`, modified (same). `ToolDB/ToolDbContext.cs`,
  created.
- **Change type** — add.
- **Location** — `ToolDbContext.cs` is a brand-new file, sitting alongside
  `Tool.cs` and `ToolRepository.cs`.
- **Dependencies** — the real `Microsoft.EntityFrameworkCore.Sqlite`
  NuGet package (Commands Needed, below); `Tool`'s own already-existing
  real shape (Records & Strong Types).

### The New Code

```csharp
public class ToolDbContext : DbContext
{
    private readonly string _dataSource;

    public ToolDbContext(string dataSource)
    {
        _dataSource = dataSource;
    }

    public DbSet<Tool> Tools => Set<Tool>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSqlite($"Data Source={_dataSource}");
    }
}
```

### The Updated Project

`ToolDB/ToolDbContext.cs`, a brand-new file — nothing exists yet to show it
growing inside, so this *is* the whole real file (Project Change already
covers the "brand-new file" case):

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
16 }
```

This class, on its own, cannot yet be safely queried — `Tool`'s own real
property names (`OverallDiameter`, `OverallLength`, `FluteCount`) don't
match `tools`'s own real column names (`overall_diameter`,
`overall_length`, `flute_count`) any more than `Widget.Name` matched
`widget_name`, above. A real, temporary probe run this session, before this
lesson's second unit existed, proves the identical real failure against
this exact real class and this project's own real schema, not just the
`Widget` analogy:

```
REAL EXCEPTION: Microsoft.Data.Sqlite.SqliteException: SQLite Error 1: 'no such column: t.FluteCount'.
REAL GENERATED SQL: SELECT "t"."Id", "t"."FluteCount", "t"."Manufacturer", "t"."Name", "t"."OverallDiameter", "t"."OverallLength"
FROM "Tools" AS "t"
```

One further real, notable detail this real output surfaces: the generated
SQL reads `FROM "Tools"` — capital T, the real C# class name — even though
no `ToTable` call exists anywhere yet, and it still reaches the real,
lowercase `tools` table without a "no such table" error. SQLite's own real
identifier matching is case-insensitive for ASCII text, so `"Tools"` and
`"tools"` name the identical real table; the real failure here is entirely
about the column list, not the table name.

### Mechanical Walkthrough

- `public class ToolDbContext : DbContext` — `class` (reappearing) declares
  a new real type; `: DbContext` (reappearing inheritance syntax,
  established `AboutDialog : Window`) makes `ToolDbContext` a real
  subclass, inheriting every real member `DbContext` (Header, above)
  itself, above, provides.
- `private readonly string _dataSource;` — `private` (reappearing) limits
  visibility to this class alone; `readonly` (Terms, above, first
  appearance) is a real, compiler-checked promise that this field can only
  ever be assigned once, inside this class's own constructor.
- `public ToolDbContext(string dataSource)` — an ordinary real constructor
  (reappearing, established `AboutDialog(int toolCount)`), taking one real,
  required `string` parameter; `{ _dataSource = dataSource; }` assigns the
  real constructor argument into the real `readonly` field — the one real
  place that field is ever allowed to change.
- `public DbSet<Tool> Tools => Set<Tool>();` — `DbSet<Tool>` (Header,
  above) names the real property's own type; `=>` (Terms, above,
  reappearing) means this property's value is computed fresh, by calling
  the real expression on its right, every time it's read, rather than
  stored once; `Set<Tool>()` (Header, above) is the real, inherited
  `DbContext` method that produces the real, concrete `DbSet<Tool>` this
  property returns.
- `protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)`
  — `protected` (Terms, above, first appearance) means this real method is
  only callable from `DbContext` itself or a real subclass, never from
  ordinary application code; `override` (Terms, above, first appearance)
  marks this as replacing `DbContext`'s own real, empty default
  implementation of the identically-named method; `void` (reappearing)
  means it returns nothing; `DbContextOptionsBuilder optionsBuilder`
  (Header, above) is the real object `DbContext`'s own internal logic
  passes in, already partially built, for this method to finish
  configuring.
- `optionsBuilder.UseSqlite($"Data Source={_dataSource}");` — `UseSqlite`
  (Header, above) is a real, `Microsoft.EntityFrameworkCore.Sqlite`
  extension method, telling `optionsBuilder` which real database provider
  and which real connection string to use; `$"Data Source={_dataSource}"`
  (Terms, above, reappearing) builds that real connection string using the
  identical real `Data Source=...` shape this project's own
  `SqliteConnection` calls have used since this project's very first
  lesson, substituting in this real instance's own real `_dataSource`
  field.

### CS Lens

`DbContext` (Header, above) is a concrete instance of two named, real
software design patterns at once — per Microsoft's own real, fetched
documentation, quoted above, "a combination of the Unit Of Work and
Repository patterns." The **Repository pattern** hides real data-access
details behind an object that looks like an ordinary collection — this
project's own hand-written `ToolRepository` (Updating and Deleting Safely)
is already a real, hand-built instance of exactly this same pattern,
without ever using that name. The **Unit of Work pattern** groups several
real changes together so they can be tracked and committed as one real,
coordinated batch — this lesson's own third unit is where that half of the
pattern becomes directly visible, through change tracking. Also recognized
in: Java's Hibernate `Session`; Django's own ORM `Manager`/`QuerySet`
objects; any connection-pooling data-access layer sitting between
application code and a real database driver.

### SE Lens

Why introduce a second, real way to reach the exact same `tools` table
this project's own `ToolRepository` already reaches directly? The real
alternative — keep writing every future query by hand, the way this
project has done since its own first lesson — was not wrong; this
project's own real, hand-written SQL still runs unmodified after this
lesson, and this project's own real, measured `EXPLAIN QUERY PLAN` work
(Indexes & Query Planning) depended on knowing exactly what SQL runs,
something a generated query makes one real step harder to see directly
(mitigated here specifically by `ToQueryString()`, Header, above). The
real benefit an ORM buys, worth its real cost: less repetitive, hand-typed
SQL for the routine cases this project's own next step, rewriting these
queries through EF Core, covers. The real, honest cost, already proven
directly by this unit's own
two real failures: an ORM's own convention is a guess, and a wrong guess
fails at the real database, at real run time — never caught by the
compiler, the same real risk category as a hand-typed column name typo,
just moved to a different, less obviously "raw SQL" looking place in the
code.

### Run It

A real `dotnet build` was run this session against `ToolDB`: build
succeeded, 0 new Warnings, 0 Errors (the project's own pre-existing,
already-explained `CS0067` warning on `RelayCommand` is unchanged). This
class cannot yet run a real, successful query — it connects to this
project's own next real step, eventually replacing its hand-written
queries through EF Core, but first needs its own real mapping fixed, which
is exactly this lesson's second unit. The isolated `Widget` lab above and the real, temporary probe
against this exact class were both actually run this session; real source
and real captured output for both are saved in
`verification/lesson-24/lab1-dbcontext-mapping-mismatch.cs` and
`verification/lesson-24/step3-real-mismatch-then-fix-against-tool.cs`.

### Connecting Back

`ToolDbContext` now exists as a real, second entry point onto this
project's own `tools` table, built and confirmed to compile — but, exactly
like the isolated `Widget` lab already proved would happen, it cannot yet
be safely queried, because its own convention-based guess about `Tool`'s
real column names is wrong. The next unit fixes that, for real, using
Fluent API.

---

## Concept Unit: Fluent API — Mapping a Table to a Class When Convention Isn't Enough

### The Problem

The previous unit's own real, captured failure named exactly what's
missing: `ToolDbContext` needs to be told, explicitly, that
`Tool.OverallDiameter` means the real column `overall_diameter`, that
`Tool.OverallLength` means `overall_length`, that `Tool.FluteCount` means
`flute_count` — and that `Tool.Manufacturer` means no real column on
`tools` at all, since it only ever exists by joining against `vendors`
(Multiple Tables & `JOIN`). Where should that real, ORM-specific knowledge
actually live?

> **Try this first:** this project's own `Tool.cs` was deliberately built,
> starting with Records & Strong Types, as a plain domain record with no
> knowledge of ADO.NET, SQLite, or any specific persistence technology —
> `Tool.FromReader` lives in `Tool.cs` itself, but it only reads already-
> positional column values, and knows nothing about column *names*. Given
> that, would adding real, ORM-specific mapping attributes directly onto
> `Tool`'s own properties fit that existing design, or work against it?
> If the mapping information has to live somewhere else instead, where —
> and what would that place need to already have access to?

### Introduce the Concept in Isolation

The exact same real, throwaway `widgets` table from the previous unit,
still holding its own real `widget_name` column — now fixed with real
Fluent API instead of discarded outright, run for real this session:

```csharp
public class MappedWidgetContext : DbContext
{
    public DbSet<Widget> Widgets => Set<Widget>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSqlite("Data Source=lab_widgets.db");
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Widget>(entity =>
        {
            entity.ToTable("widgets");
            entity.Property(w => w.Name).HasColumnName("widget_name");
        });
    }
}
```

Real, captured output:

```
--- Lab 1c: fixed with Fluent API column mapping ---
SELECT "w"."Id", "w"."widget_name"
FROM "widgets" AS "w"
1: 'Left Bracket'
2: 'Right Bracket'
```

This real output proves the fix directly: the real generated SQL now
selects `"w"."widget_name"`, not `"w"."Name"`, and the real query succeeds,
returning both of this lab's own real seeded rows. This technique — real,
chainable configuration calls inside `OnModelCreating`, rather than
attributes on the entity class itself — is called **Fluent API**
(Terms, above).

### Discard the Throwaway Example

The `Widget`/`widget_name` table is fully discarded now — it never appears
in this project again. What's proven is that `EntityTypeBuilder<TEntity>`'s
own real `ToTable`/`Property`/`HasColumnName` chain (Header, above)
genuinely overrides a wrong convention — not this specific throwaway
mismatch.

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/ToolDbContext.cs`, modified (new
  `OnModelCreating` override). `ToolDB.Tests/ToolDbContextTests.cs`,
  created (first real, permanent test).
- **Change type** — add.
- **Location** — `ToolDbContext.cs`, directly after `OnConfiguring`,
  established this lesson's first unit.
- **Dependencies** — `Tool`'s own real properties (Records & Strong
  Types); `tools`'s own real, live column names (Schema Design, Multiple
  Tables & `JOIN`).

### The New Code

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Tool>(entity =>
    {
        entity.ToTable("tools");
        entity.Property(t => t.OverallDiameter).HasColumnName("overall_diameter");
        entity.Property(t => t.OverallLength).HasColumnName("overall_length");
        entity.Property(t => t.FluteCount).HasColumnName("flute_count");
        entity.Ignore(t => t.Manufacturer);
    });
}
```

### The Updated Project

`ToolDB/ToolDbContext.cs`, with the new method added directly after
`OnConfiguring`:

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
17     protected override void OnModelCreating(ModelBuilder modelBuilder)              // ← new
18     {                                                                                // ← new
19         modelBuilder.Entity<Tool>(entity =>                                          // ← new
20         {                                                                            // ← new
21             entity.ToTable("tools");                                                 // ← new
22             entity.Property(t => t.OverallDiameter).HasColumnName("overall_diameter"); // ← new
23             entity.Property(t => t.OverallLength).HasColumnName("overall_length");    // ← new
24             entity.Property(t => t.FluteCount).HasColumnName("flute_count");          // ← new
25             entity.Ignore(t => t.Manufacturer);                                       // ← new
26         });                                                                           // ← new
27     }                                                                                 // ← new
28 }
```

`ToolDbContext` now fully, correctly maps every real column `tools`
actually has, and explicitly excludes the one `Tool` property
(`Manufacturer`) that isn't one. Real, captured proof, run this session
against a real, disposable copy of this project's own schema:

```
--- REAL generated SQL, fixed ToolDbContext ---
SELECT "t"."Id", "t"."flute_count", "t"."Name", "t"."overall_diameter", "t"."overall_length"
FROM "tools" AS "t"
--- REAL queried Tool: Id=1, Name='Test End Mill', Manufacturer='', OverallDiameter=0.5, OverallLength=3, FluteCount=4 ---
```

`Manufacturer` no longer appears in the real generated `SELECT` list at
all — `Ignore` (Header, above) removed it from the model entirely, so the
query never even asks the database for it. The real `Tool.Manufacturer`
value shown above (`''`) is `Tool`'s own ordinary real default (`= ""`,
established Records & Strong Types), not anything read back from the
database — the real, concrete meaning of this lesson's own title: an ORM
maps to what a table *actually has*, never to a convenient shape a
different, joined query happens to produce.

### Mechanical Walkthrough

- `protected override void OnModelCreating(ModelBuilder modelBuilder)` —
  `protected`/`override`/`void` (Terms, above, reappearing from this
  lesson's first unit) apply identically here; `ModelBuilder modelBuilder`
  (Header, above) is the real object `DbContext`'s own internal startup
  logic passes in, once, the first time this context's real model is
  needed.
- `modelBuilder.Entity<Tool>(entity => { ... });` — `Entity<Tool>()`
  (Header, above, part of `ModelBuilder`) is a real, generic method
  returning a real `EntityTypeBuilder<Tool>`; `entity => { ... }` is a real
  lambda expression, the identical real construct already established by
  this project's own `RelayCommand` callbacks, here used as a real
  configuration callback rather than an event handler — its own
  parameter, `entity`, is that same real
  `EntityTypeBuilder<Tool>`.
- `entity.ToTable("tools");` — `ToTable` (Header, above) is a real
  instance method, explicitly naming the real table this entity maps to,
  overriding the previous unit's own real, implicit `"Tools"` guess.
- `entity.Property(t => t.OverallDiameter).HasColumnName("overall_diameter");`
  (and the two lines after it, for `OverallLength`/`FluteCount`) — `Property`
  (Header, above) is called with a second real lambda, `t => t.OverallDiameter`,
  reading an already-existing real property rather than assigning
  anything; `HasColumnName` (Header, above) is chained directly onto its
  own real return value, overriding the convention for that one real
  property. Each of these three real lines is its own, separate, real
  fluent-chain link, per this project's own established rule that a
  chained call sequence gets explained link by link, not waved through as
  one block — even though all three lines share an identical real shape.
- `entity.Ignore(t => t.Manufacturer);` — `Ignore` (Header, above) is
  called with a third real lambda, `t => t.Manufacturer`, removing that
  one real property from the model entirely, the real, concrete fix for
  the one `Tool` property that has no real column to map to at all.

### CS Lens

Each real line inside `OnModelCreating`'s own callback (`ToTable`,
`Property(...).HasColumnName(...)`, `Ignore`) is called on the same real
`entity` object, and — except for `Property`, which returns a different,
related real object to keep chaining — each real method returns that same
real object back, so real calls can be written one after another instead
of as separate real statements each re-fetching `modelBuilder.Entity<Tool>()`.
This is a concrete instance of the **Builder pattern** — an object built
specifically to be configured through a real sequence of chained calls,
each one narrowing or adding to a real, accumulated result, rather than
through one large constructor call or several disconnected, real,
separate statements. Also recognized in: this project's own JavaScript,
where jQuery's own real `$('#x').addClass('y').show()` chain (jQuery
Basics) already does the identical real thing; .NET's own real
`StringBuilder`; any real HTTP client library offering
`.WithHeader(...).WithBody(...)`-style request construction.

### SE Lens

Why configure `Tool`'s own real mapping here, inside `ToolDbContext`,
rather than directly on `Tool` itself, using EF Core's own real Data
Annotation attributes (for example, a real `[Column("overall_diameter")]`
attribute placed directly above `OverallDiameter`)? The real alternative
not chosen — Data Annotations — was rejected here for a real, concrete
reason, not just a stylistic preference: per Microsoft's own real, fetched
documentation, quoted in this lesson's own Header, Fluent API "allows
configuration to be specified without modifying your entity classes" —
and `Tool.cs` was deliberately built, in Records & Strong Types, to be a
plain domain record with no persistence-technology knowledge baked into
it at all. Adding EF-specific attributes directly to `Tool` would tie that
same class to EF Core specifically, the exact coupling this project's own
existing, hand-written `ToolRepository` and `Tool.FromReader` already
avoid by depending only on ADO.NET's own reader positions, never on column
*names*. The honest cost, stated plainly rather than hidden: this real
mapping now exists in a second, separate real place (`ToolDbContext.cs`)
that nothing currently forces to stay in sync, by hand, with `tools.db`'s
own real, live schema — if a future lesson adds or renames a real column
without updating this file, the identical real failure this unit's own
first Concept Unit just demonstrated happens again, silently, until
something actually queries it. Schema Migrations & Versioning is where
this project's own roadmap addresses that real risk directly.

### Run It

A real `dotnet build` was run this session: build succeeded, 0 new
Warnings, 0 Errors. A new, real, permanent test,
`ToolDbContextTests.Tools_MapsRealColumns_AndIgnoresManufacturer`, was
added to a new file, `ToolDB.Tests/ToolDbContextTests.cs`, against a real,
disposable copy of this project's own current schema (never the real,
live `tools.db`) — confirmed passing this session. Real source and
captured output for the isolated `Widget` fix and the real probe against
`Tool` are saved in `verification/lesson-24/lab1-dbcontext-mapping-mismatch.cs`
and `verification/lesson-24/step3-real-mismatch-then-fix-against-tool.cs`.

### Connecting Back

`ToolDbContext` can now be queried safely and correctly — the previous
unit's own real failure is fixed, and its own real, honest cost (a second
place holding schema knowledge) is stated directly rather than hidden. The
next unit puts this same, now-working `ToolDbContext` to a second real
use: not just reading `Tool` back, but changing one of its values and
writing that change back to the database — without ever calling
`tool.FluteCount = ...` directly.

---

## Concept Unit: Change Tracking — How `SaveChanges` Knows What to Write

### The Problem

This project's own existing `ToolRepository.UpdateFluteCount` (Updating
and Deleting Safely) already updates a tool's flute count — but only by
being told the new value directly, as a plain `int` parameter, and writing
one hand-typed `UPDATE` statement unconditionally, every time it's called,
whether or not the value actually changed. If a `Tool` is queried back
through `ToolDbContext` instead, could the context itself notice that one
of its properties changed and write only that real change back — and, if
so, how, given that `Tool`'s own real properties are `init`-only, so
`tool.FluteCount = 6;` on an already-queried instance is a real, immediate
`CS8852` compile error?

> **Try this first:** `Tool`'s own `init`-only properties (Records &
> Strong Types) exist specifically so that, once constructed, nothing can
> silently change a `Tool`'s own values through ordinary assignment. Given
> that guarantee is real and enforced by the compiler itself, what would a
> real mechanism for "changing one already-queried value" have to look
> like instead of ordinary property assignment — and where might such a
> mechanism plausibly live, given that `DbContext` (not `Tool` itself) is
> the object that already knows this entity was queried in the first
> place?

### Introduce the Concept in Isolation

A minimal, real, throwaway `Gadget` — deliberately built as an immutable
`record` with `init`-only properties, the identical real shape as `Tool`
itself — run for real this session in `LabScratch/Program.cs`:

```csharp
public record Gadget
{
    public int Id { get; init; }
    public string Name { get; init; } = "";
}

public class GadgetContext : DbContext
{
    public DbSet<Gadget> Gadgets => Set<Gadget>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSqlite("Data Source=lab_gadgets.db");
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Gadget>().ToTable("gadgets");
    }
}
```

Real, captured output, querying one real `Gadget`, then mutating and
saving it through `EntityEntry.Property(...).CurrentValue` instead of
ordinary assignment:

```
--- Lab 3a: querying an immutable (init-only) record entity ---
Queried: 1, 'Gadget A'
--- Lab 3b: gadget.Name = "..." here would be a compile error (CS8852, init-only); mutating via EntityEntry.Property(...).CurrentValue instead ---
--- Lab 3c: real change tracker debug view before SaveChanges ---
Gadget {Id: 1} Modified
    Id: 1 PK
    Name: 'Gadget A (Renamed)' Modified Originally 'Gadget A'

--- Lab 3d: calling SaveChanges ---
--- Lab 3e: real value in gadgets.name after SaveChanges: 'Gadget A (Renamed)' ---
```

This real, captured output proves the Socratic question's own answer
directly: `context.Entry(gadget).Property(g => g.Name).CurrentValue = "..."`
genuinely changes the tracked real value — real, visible proof that EF
Core's own real change-tracking mechanism operates independently of
`Gadget`'s own C# accessors entirely, reaching the real, underlying value
some other real way, and that `SaveChanges` genuinely persists exactly
that real change to the real database, confirmed by a plain, real
`SqliteCommand` read afterward, outside EF Core entirely.

### Discard the Throwaway Example

The throwaway `Gadget`/`gadgets` table is discarded now — it never
appears in this project again. What's proven is that change tracking
(Terms, above) genuinely works against an immutable, `init`-only record —
not this specific throwaway rename.

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB.Tests/ToolDbContextTests.cs`, modified (a
  second real, permanent test). No production file changes — `ToolDbContext`
  already fully supports this; this unit proves a capability it already
  has, the same way this project's own earlier lessons have proven a
  capability through tests alone when nothing else needed to change.
- **Change type** — add.
- **Location** — `ToolDbContextTests.cs`, directly after
  `Tools_MapsRealColumns_AndIgnoresManufacturer`, established this
  lesson's second unit.
- **Dependencies** — `ToolDbContext` (this lesson's first and second
  units, already complete); `Tool`'s own real, `init`-only shape (Records
  & Strong Types).

### The New Code

```csharp
[Fact]
public void ChangeTracking_UpdatesFluteCount_ThroughEntityEntry()
{
    string path = CreateTestDatabase("test_efcore_change_tracking.db");

    using (var context = new ToolDbContext(path))
    {
        Tool tool = context.Tools.Single();
        context.Entry(tool).Property(t => t.FluteCount).CurrentValue = 6;
        context.SaveChanges();
    }

    using var verifyConnection = new SqliteConnection($"Data Source={path}");
    verifyConnection.Open();
    using var command = new SqliteCommand("SELECT flute_count FROM tools WHERE id = 1", verifyConnection);
    var fluteCount = command.ExecuteScalar();

    Assert.Equal(6L, fluteCount);
}
```

### The Updated Project

`ToolDB.Tests/ToolDbContextTests.cs`, with the new test added directly
after the previous unit's own real test:

```csharp
1  public class ToolDbContextTests
2  {
3      private static string CreateTestDatabase(string path)
4      {
5          /* unchanged, established this lesson's second unit */
23     }
24
25     [Fact]
26     public void Tools_MapsRealColumns_AndIgnoresManufacturer()
27     {
28         /* unchanged, established this lesson's second unit */
36     }
37
38     [Fact]                                                                        // ← new
39     public void ChangeTracking_UpdatesFluteCount_ThroughEntityEntry()             // ← new
40     {                                                                             // ← new
41         string path = CreateTestDatabase("test_efcore_change_tracking.db");       // ← new
42                                                                                     // ← new
43         using (var context = new ToolDbContext(path))                             // ← new
44         {                                                                          // ← new
45             Tool tool = context.Tools.Single();                                    // ← new
46             context.Entry(tool).Property(t => t.FluteCount).CurrentValue = 6;      // ← new
47             context.SaveChanges();                                                 // ← new
48         }                                                                          // ← new
49                                                                                     // ← new
50         using var verifyConnection = new SqliteConnection($"Data Source={path}");  // ← new
51         verifyConnection.Open();                                                   // ← new
52         using var command = new SqliteCommand("SELECT flute_count FROM tools WHERE id = 1", verifyConnection); // ← new
53         var fluteCount = command.ExecuteScalar();                                  // ← new
54                                                                                     // ← new
55         Assert.Equal(6L, fluteCount);                                              // ← new
56     }                                                                              // ← new
57 }
```

Real, captured proof — the same real mechanism proven against the real
project's own `Tool`, not just the isolated `Gadget`, run this session as
a temporary probe before finalizing this exact test:

```
--- REAL ChangeTracker.DebugView.LongView before SaveChanges ---
Tool {Id: 1} Modified
    Id: 1 PK
    FluteCount: 6 Modified Originally 4
    Name: 'Test End Mill'
    OverallDiameter: 0.5
    OverallLength: 3
```

Real, notable: `Manufacturer` does not appear in this real debug view at
all — the previous unit's own real `Ignore` call removed it from the
tracked model entirely, so the change tracker has nothing to say about it,
the same as it would for any C# field EF Core was never told to map.

### Mechanical Walkthrough

- `Tool tool = context.Tools.Single();` — `Single()` (Header, above)
  executes a real query expecting exactly one real row, returning one real,
  now-tracked `Tool`.
- `context.Entry(tool).Property(t => t.FluteCount).CurrentValue = 6;` —
  `Entry(tool)` (Header, above) returns a real `EntityEntry<Tool>` for this
  specific, already-tracked instance; `.Property(t => t.FluteCount)`
  (Header, above, this distinct overload) returns a real
  `PropertyEntry<Tool, int>` for that one specific real property;
  `.CurrentValue = 6` (Header, above) overwrites the real tracked value
  directly — genuinely different from `tool.FluteCount = 6`, which remains
  a real, immediate `CS8852` compile error on this same `init`-only
  property, exactly as `record`/`init` (Terms, above) require.
- `context.SaveChanges();` (Header, above) — turns the one real, tracked
  `Modified` change (`EntityState`, Header, above) into one real `UPDATE`
  statement, run immediately against the real database this context is
  configured for.
- `using var verifyConnection = new SqliteConnection($"Data Source={path}");`
  and the two real lines after it — reappearing, plain ADO.NET (Everything
  else in the file, above), deliberately reading the real, saved value back
  *outside* EF Core entirely, so this real test's own proof doesn't depend
  on trusting the very mechanism it's testing.
- `Assert.Equal(6L, fluteCount);` — reappearing (established Querying
  Back), the real xUnit assertion confirming the real database itself, not
  merely `tool`'s own in-memory state, actually changed.

### CS Lens

Reading a real value, remembering what it originally was, and later
comparing the two to decide whether a real write is even necessary is a
concrete instance of **dirty checking** — a real, general technique for
avoiding unnecessary work by tracking exactly what changed since the last
known-good state, rather than assuming everything needs rewriting. Also
recognized in: Git's own real staging area, which only ever commits files
it detects as actually changed; a real autosave feature that skips writing
to disk when nothing has changed since the last save; React's own real
virtual-DOM diffing, which only touches the real, live DOM nodes whose
underlying data actually changed.

### SE Lens

Why let `DbContext` track and diff values automatically, instead of doing
what this project's own `ToolRepository.UpdateFluteCount` already does —
accept the new value directly as a plain parameter and just write it,
unconditionally, every time? The real alternative not chosen —
`ToolRepository`'s own existing shape — is simpler to reason about locally
and remains exactly as this project left it, unmodified, for a real
reason: it's a legitimate, working, real design, not a mistake this lesson
is correcting. The real benefit change tracking buys instead: per
Microsoft's own real, fetched documentation, quoted in this lesson's own
Header, "Updates are limited to only those values that have actually
changed" — a real efficiency `ToolRepository.UpdateTool`'s own current SQL
doesn't have, since it unconditionally sets all four of `Tool`'s
real, editable fields on every single real call, whether or not each one
actually changed. The real, honest cost: change tracking only works while
the *same* `DbContext` instance stays alive between the real query and the
real save — per that same real documentation, "DbContext is designed to
represent a short-lived unit-of-work" — a real lifetime discipline this
project's own `SqliteConnection`-per-call convention already happens to
satisfy, but a genuinely new constraint to hold in mind, not one ADO.NET
code ever had to think about, since a plain `SqliteCommand` never
remembers anything about a previous read at all.

### Run It

A real `dotnet build` was run this session: build succeeded, 0 new
Warnings, 0 Errors. A second new, real, permanent test,
`ChangeTracking_UpdatesFluteCount_ThroughEntityEntry`, was added to
`ToolDbContextTests.cs`. **Full suite: 26 tests, 0 failures** — the real,
current, full count for this project (up from 24 before this lesson). Real
source and captured output for the isolated `Gadget` lab and the real
change-tracking proof against `Tool` are saved in
`verification/lesson-24/lab2-change-tracking-init-only-record.cs` and
`verification/lesson-24/lab3-and-step4-change-tracking.cs`.

### Connecting Back

`ToolDbContext` can now do everything this lesson set out to prove: map a
real table to a real class correctly (previous unit), and change-track a
real, already-queried, `init`-only `Tool` well enough to write back only
what actually changed (this unit) — without ever calling `tool.FluteCount
= 6` directly, and without touching this project's own existing,
unmodified ADO.NET code at all.

---

## Commands Needed

- `dotnet add package Microsoft.EntityFrameworkCore.Sqlite --version 9.0.9`
  — run once inside `ToolDB/` and once inside `ToolDB.Tests/`. `dotnet` is
  this project's own real .NET CLI, established Environment & Project
  Setup; `add package` (established the same lesson) adds one real NuGet
  reference to the current folder's own `.csproj` file and restores it.
  `--version 9.0.9` is real and required here, not optional: the real,
  latest `Microsoft.EntityFrameworkCore.Sqlite` package (`10.0.11`, at the
  time of this session) only supports `net10.0`, while every project in
  this repository targets `net9.0`/`net9.0-windows` (an environment
  constraint from this project's own earlier session, unrelated to this
  lesson's own content) — running the same command with no `--version`
  fails for real with a genuine `NU1202` error naming exactly that real
  mismatch. Real success output ends with a line naming the real, restored
  package and version, the same shape this project has seen since its own
  first NuGet install.

---

## Connect the Pieces

The same real tool — id `1`, `1/2 in 4-Flute Carbide End Mill` — traced
through all three units, alongside the isolated labs that proved each real
mechanism first:

1. A brand-new, real `ToolDbContext` was built, giving this project a
   second, real, queryable path to the exact same `tools` table
   `ToolRepository` already reads — proven, immediately, not to work yet,
   by a real, captured failure against both an isolated `Widget` table and
   this project's own real `Tool`/`tools` schema, since neither this
   lesson's own new class nor EF Core's own default convention had been
   told how `Tool`'s real properties correspond to `tools`'s real columns
   (Unit 1).
2. Real Fluent API configuration, added to `OnModelCreating`, fixed that
   real failure — mapping each of `Tool`'s three mismatched real
   properties to its real column, and explicitly excluding `Manufacturer`,
   since no real column for it exists on `tools` at all, only ever a
   joined value from `vendors`. A new, real, permanent test confirmed this
   exact tool now queries correctly through `ToolDbContext`, with
   `Manufacturer` genuinely absent from the real generated SQL rather than
   silently wrong (Unit 2).
3. That same real, now-correctly-mapped tool was queried again, and its
   real `FluteCount` was changed from `4` to `6` — not through ordinary
   property assignment, which remains a real `CS8852` compile error on
   `Tool`'s own `init`-only properties, but through
   `EntityEntry.Property(...).CurrentValue`, proven first against an
   isolated `Gadget` record sharing the identical real shape. A second new,
   real, permanent test confirmed `SaveChanges` genuinely wrote that one
   real change back to the actual database, read back independently
   through plain ADO.NET (Unit 3).

**Slice 5 is underway.** This project's own existing, hand-written
ADO.NET code — `ToolRepository`, and every real query inside
`MainWindow.xaml.cs` — is completely unmodified and still fully in use;
`ToolDbContext` exists alongside it, proven correct, not yet relied on by
anything real yet. **Next lesson:** 25 — Rewriting Your Queries Through EF
Core (LINQ side-by-side with the raw ADO.NET from Slices 1–3, verified
against the tests already written for the ADO.NET version).
