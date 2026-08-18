# Lesson 1: Static Types, Connection Strings, and a Resource's Lifetime
### (Connecting to a Database File)

**What you will build.** By the end of this lesson, `ToolDB`'s `Program.cs`
opens a real connection to a SQLite database file — `tools.db` — that
doesn't exist yet when the program starts, proves that file appears on
disk purely as a side effect of opening the connection, prints the
connection's own live state, and releases the connection safely even if
something goes wrong in between. No table, no data, no query yet — that's
later lessons' job. The transferable problem this lesson is actually about
is bigger than SQLite: how a statically-typed language guarantees a
variable can only ever hold one kind of value; how a program describes an
external resource it wants to talk to as plain text a driver can parse
instead of baking that detail into compiled code; and how code guarantees
an external resource — a database connection, a file handle, a network
socket — gets released even when an exception interrupts the code that was
supposed to release it. Every later lesson in this curriculum that opens a
connection, holds a file, or acquires anything the operating system tracks
independently of C#'s garbage collector reuses this exact shape.

**What you need to know first.** Lesson 0 — the `ToolDB` project exists on
disk, targets `net10.0`, already has a `PackageReference` for
`Microsoft.Data.Sqlite` (version `10.0.11`) restored and building cleanly
with `dotnet build`, and `dotnet run` currently prints only
`Hello, World!` via a single top-level statement. This lesson replaces
that one line.

**Terms used in this lesson**

- **database** — an organized collection of persistent data, stored and
  retrieved through a system built for exactly that purpose (querying,
  keeping data consistent, controlling who can change what at the same
  time), rather than read and written as raw, unstructured bytes the way a
  `.txt` file is. It exists because "just write bytes to a file" gets
  unmanageable fast once more than one piece of related data, or more than
  one program, needs to read and change that data safely.
- **SQLite** — a specific, extremely widely used relational database
  engine, distinguished from most other database systems by storing an
  entire database — schema, tables, every row — as one ordinary file on
  disk, with no separate server process to install, configure, or keep
  running. It exists because most database engines (SQL Server,
  PostgreSQL) assume a long-running server process a client connects to
  over a network, which is unnecessary weight for a single-user desktop
  tool like `ToolDB` that just needs to read and write its own local file.
- **connection** — a live, stateful link between a running program and a
  specific database, opened before any command can be sent to that
  database and explicitly released when the program is done with it. It
  exists as a distinct, reusable object — rather than every database
  operation implicitly opening and closing its own link — because opening
  a link has real, measurable cost, which is exactly why it's modeled as
  something acquired once and reused, not something implicit in every
  call.
- **connection string** — a single piece of plain text, formatted as
  semicolon-separated `Keyword=Value` pairs, that tells a database driver
  everything it needs to open a connection: which file, in what mode, with
  which options. It exists so that *where* and *how* to connect can be
  written, read, and changed as ordinary text — by a person, a config
  file, or a deployment script — instead of being baked into compiled code
  as a series of constructor arguments unique to each database provider.
- **ADO.NET** — .NET's own umbrella standard for talking to any tabular
  data source (SQL Server, PostgreSQL, SQLite, and others) through a
  common shape: every provider exposes its own connection, command, and
  reader types, but all of them follow the same conventions, including the
  semicolon-separated connection-string format above. It exists so code
  written against the general ADO.NET shape — and the general
  connection-string syntax — largely transfers from one database provider
  to another.
- **static typing** — a language design in which every variable's type is
  fixed at the point it's declared, and checked by the compiler before the
  program ever runs, rather than being free to hold any kind of value at
  any time. This is genuinely new relative to Python, where a name like
  `x = "hello"` can be rebound to `x = 5` a line later with nothing
  objecting, because Python checks types while the program runs, not
  before.
- **type inference (`var`)** — a C# feature that lets the compiler
  determine a variable's static type from the expression used to
  initialize it, instead of requiring that type to be written out by hand.
  It exists to remove visual repetition (writing a type name twice — once
  as the declared type, once again as the constructor being called)
  without weakening static typing at all — proven, not just asserted,
  later in this lesson.
- **resource** — anything a program acquires from outside its own managed
  memory that only a limited number of other things can also be using at
  once, and that must be explicitly given back — a database connection, an
  open file, a network socket, a lock. It exists as a distinct category
  from an ordinary object (a `string`, a `List<int>`) because ordinary C#
  objects are reclaimed automatically; resources are not, which is exactly
  the gap the next few terms exist to close.
- **garbage collector** — the part of the .NET runtime that automatically
  reclaims memory used by ordinary managed objects once nothing in the
  program can reach them anymore, without the programmer ever calling a
  "free" function by hand. It matters here specifically as a contrast: the
  garbage collector reclaims *memory*, on its own schedule, whenever it
  decides to run — it does not know or care that a `SqliteConnection`
  object is also holding open an OS-level file handle that something else
  might be waiting on right now.
- **resource lifetime** — the span of time between when a resource is
  acquired (a connection opened) and when it's released (closed or
  disposed), and the discipline of keeping that span as short as
  correctness allows while guaranteeing release happens on every code
  path, including ones that hit an exception partway through. It exists
  because, unlike memory, a leaked resource has consequences visible to
  *other* programs and other parts of the operating system right now, not
  just to this process's own memory usage.
- **using directive** — a C# statement, written `using SomeNamespace;` at
  the top of a file, that tells the compiler "let me refer to types in
  this namespace by their short name, without writing the full dotted path
  every time." This is one of two completely unrelated things the `using`
  keyword means in C# — this term covers only the namespace-import
  meaning; the resource-cleanup meaning below is a different term
  entirely, despite sharing the same keyword.
- **`IDisposable`** — a standard .NET interface, in the `System` namespace,
  with exactly one method, `Dispose()`, that any type wraps around "I hold
  a resource that needs explicit cleanup" implements. It exists as a
  single shared contract so that generic cleanup code (the `using`
  construct below) can reliably clean up *any* disposable object the same
  way, without needing to know what specific kind of resource that object
  happens to be holding.
- **using declaration / using statement** — the *other*, unrelated meaning
  of the `using` keyword: a C# construct that ties a disposable object's
  `Dispose()` call to the end of a scope, guaranteeing it runs — even if an
  exception is thrown partway through that scope — without the programmer
  writing a manual `try`/`finally` by hand. Proven, not just asserted,
  later in this lesson.
- **connection state** — a live status value a connection object exposes,
  describing whether it's currently closed, open, or (for some providers)
  mid-operation — readable at any point without changing anything, purely
  to observe where in its lifetime a connection currently is.
- **connection pooling** — an optimization where closing or disposing a
  connection doesn't necessarily release its underlying native handle
  immediately; instead, that handle is kept alive in a pool, ready to be
  handed back out the next time a connection to the same database is
  opened, because establishing a brand-new native connection is measurably
  more expensive than reusing one that's already open. It exists purely
  for performance — and, as this lesson proves for real, it has a real,
  honest consequence for exactly the kind of file-lock test this lesson
  runs.
- **file lock** — an operating-system-level mechanism where a process that
  has a file open can prevent other processes — or even the same process,
  through a different handle — from deleting, renaming, or sometimes even
  reading that same file until every open handle to it is released. This
  isn't a SQLite or .NET concept at all; it's the OS enforcing that a file
  currently in active use doesn't get pulled out from under whatever is
  using it.

**Objects and methods used**

- **`SqliteConnection`**
  - *What it is:* the primary class this entire lesson is about — a class
    in the `Microsoft.Data.Sqlite` namespace representing one connection to
    a SQLite database, and the reason the package installed in Lesson 0
    exists at all.
  - *Implementation:* `public class SqliteConnection : System.Data.Common.DbConnection`
    — it inherits from ADO.NET's abstract `DbConnection` base class, which,
    several levels up its own inheritance chain, ultimately implements
    `IDisposable` (confirmed from Microsoft's own public API reference for
    `SqliteConnection`, fetched this session). Its full public surface is
    large (transactions, custom SQL functions, schema queries); only the
    members this lesson actually calls are given full treatment below, at
    the point each is first used.
  - *Its use:* the one object this whole lesson exists to create, open,
    observe, and safely release.
- **`SqliteConnection(string connectionString)`**
  - *What it is:* one of `SqliteConnection`'s two public constructors (the
    other takes no arguments).
  - *Implementation:* takes a single connection-string argument and stores
    it as the connection's `ConnectionString`; documented on Microsoft's
    own public API reference for `SqliteConnection`, fetched this session.
  - *Its use:* builds the connection object using the connection string
    assembled in this lesson's first Concept Unit, in one step, instead of
    constructing with no arguments and setting `.ConnectionString`
    afterward.
- **`SqliteConnection.Open()`**
  - *What it is:* the method that actually establishes the live link to
    the database file named in the connection string.
  - *Implementation:* `public override void Open()`. Microsoft's own
    documentation states its exact behavior plainly, quoted verbatim, fetched
    this session: "Opens a connection to the database using the value of
    `ConnectionString`. If `Mode=ReadWriteCreate` is used (the default) the
    file is created, if it doesn't already exist."
  - *Its use:* the single call that turns a connection string — inert
    text — into a real, live connection, and, as a side effect this lesson
    proves rather than assumes, the moment the database file itself gets
    created on disk.
- **`SqliteConnection.State`**
  - *What it is:* a read-only property exposing the connection's current
    connection state.
  - *Implementation:* returns `System.Data.ConnectionState`, a `[Flags]`
    enum (confirmed from Microsoft's own public API reference, fetched
    this session) with real named values `Closed = 0`, `Open = 1`,
    `Connecting = 2`, `Executing = 4`, `Fetching = 8`, `Broken = 16`.
  - *Its use:* read before and after `Open()`/`Close()` throughout this
    lesson's labs and real project code, purely to observe the
    connection's lifetime from the outside, rather than trusting an
    unverified claim about what those methods do.
- **`SqliteConnection.Close()`**
  - *What it is:* the method that ends the live link to the database,
    without necessarily destroying the object itself.
  - *Implementation:* `public override void Close()`; Microsoft's own
    reference describes it plainly: "Closes the connection to the
    database. Open transactions are rolled back."
  - *Its use:* the manual way to release a connection, used in this
    lesson's second Concept Unit before the third replaces it with
    something safer.
- **`SqliteConnection.Dispose()`**
  - *What it is:* `SqliteConnection`'s implementation of the single method
    every `IDisposable` type must provide.
  - *Implementation:* Microsoft's reference lists `Dispose(Boolean)` —
    "Releases any resources used by the connection and closes it" — the
    protected overload backing the public parameterless `Dispose()`
    inherited from `DbConnection`/`IDisposable`.
  - *Its use:* what actually runs, automatically, at the end of a `using`
    declaration's scope — proven, not assumed, in this lesson's third
    Concept Unit.
- **`SqliteConnection.ClearAllPools()`**
  - *What it is:* a `static` method — meaning it's called on the class
    itself, `SqliteConnection.ClearAllPools()`, not on any one connection
    instance, because it acts on every pooled connection across the whole
    process at once.
  - *Implementation:* "Empties the connection pool," per Microsoft's own
    reference, fetched this session.
  - *Its use:* used only inside this lesson's third Concept Unit, in an
    isolated lab, to prove that connection pooling — not a bug — is what's
    holding a file handle open even after `Dispose()` runs.
- **`IDisposable`**
  - *What it is:* the standard .NET interface named in the Terms glossary
    above — a contract, not a class, meaning it can never be constructed
    with `new`; only implemented by other types.
  - *Implementation:* `public interface IDisposable { void Dispose(); }`,
    in the `System` namespace — one method, no properties, no other
    members.
  - *Its use:* `SqliteConnection` implements it (inherited through
    `DbConnection`), which is exactly what makes a `using` declaration
    legal on a `SqliteConnection` variable at all — `using` only accepts
    expressions of a type that implements `IDisposable`.

**Everything else in the file, not this lesson's subject but still
explained**

- **`Console.WriteLine(string?)`**
  - *What it is:* reappearing from Lesson 0 — a `static` method on
    `System.Console` (`static` meaning it belongs to the class itself, not
    to an instance).
  - *Implementation:* `public static void WriteLine(string? value)` —
    takes one nullable string, returns nothing, writes it to standard
    output followed by a newline.
  - *Its use:* called repeatedly throughout this lesson to make every
    internal state change — a connection's state, whether a file exists —
    visible as real, observable output, instead of something only
    provable by re-reading the source.
- **`object.GetType()`**
  - *What it is:* a diagnostic tool, not this lesson's own subject —
    an instance method inherited by every C# object, since every type
    ultimately derives from `System.Object`.
  - *Implementation:* `public Type GetType()`, returning a `System.Type`
    object describing the value's actual runtime type.
  - *Its use:* used only in the first Concept Unit's throwaway lab, to
    prove — at runtime, not just by reading the declared syntax — that a
    `var`-declared variable really did resolve to `System.String`, the
    same runtime type as an explicitly-declared `string`.
- **`File.Exists(string? path)`**
  - *What it is:* a diagnostic tool, not this lesson's own subject — a
    `static` method on `System.IO.File`.
  - *Implementation:* takes a path, returns `bool` — `true` if a file
    exists at that path, `false` otherwise, including if the path is
    invalid or inaccessible; it never throws just because a file is
    missing.
  - *Its use:* used throughout to check, from outside `SqliteConnection`
    entirely, whether opening a connection really did create a file on
    disk — a second, independent witness to `Open()`'s documented
    behavior, not just trust in a property readout from the same object
    being tested.
- **`FileInfo`**
  - *What it is:* a diagnostic tool, not this lesson's own subject — a
    class in `System.IO` used only in the second Concept Unit's throwaway
    lab, wrapping one specific file path so its real properties (size,
    timestamps, read-only status) can be inspected.
  - *Implementation:* `public sealed class FileInfo : System.IO.FileSystemInfo`;
    constructed with `FileInfo(string fileName)`, and its `Length`
    property — `public long Length { get; }` — "Gets the size, in bytes,
    of the current file," per Microsoft's own public API reference for
    `FileInfo`, fetched this session.
  - *Its use:* `new FileInfo("lab.db").Length` is the exact mechanism this
    lesson uses to prove, in bytes, that the file `Open()` created is
    genuinely empty — a real number, not a description of "an empty
    placeholder."
- **`File.Delete(string path)`**
  - *What it is:* a diagnostic tool, not this lesson's own subject — a
    `static` method on `System.IO.File`, used only in the third Concept
    Unit's throwaway labs.
  - *Implementation:* takes a path, returns `void`; throws
    `System.IO.IOException` if the file is currently in use by another
    process — or another handle in the same process — and can't be
    deleted.
  - *Its use:* the exact mechanism used to prove a connection genuinely
    holds a file lock — not by reading a claim about locking, but by
    trying to break it and watching the real exception.

---

## Concept Unit: Static Typing — Declaring a Variable's Type, Explicitly and by Inference

### The Problem

Lesson 0's entire `Program.cs` was one line with no variable in it at all.
This lesson's first real addition needs to name a piece of text so it can
be reused instead of retyped — the connection string the next unit builds
meaning around. In Python, naming a value is just assignment:
`message = "hello"`, and that same name could hold an integer a line
later with nothing objecting. C# raises a real question before any of
that: what actually happens if code tries to do the same thing here?

### Introduce the Concept in Isolation

In the (recreated) throwaway `LabScratch` project:

```csharp
string a = "hello";
var b = "hello";
Console.WriteLine(a);
Console.WriteLine(b);
Console.WriteLine(a.GetType());
Console.WriteLine(b.GetType());
```

Real output, captured this session:

```
hello
hello
System.String
System.String
```

`a` was declared with an explicit type (`string`); `b` was declared with
`var`, letting the compiler infer its type from the value on the right of
`=`. Both print identical text, and — proven, not assumed, by calling
`.GetType()` on each and printing the real runtime type — both really are
the exact same type, `System.String`. `var` is not "any type, decided
later"; it's the compiler filling in the same explicit type by inference,
once, at compile time, from the expression handed to it. This is called
**static typing** — and the mechanism that let `b` skip writing `string`
out by hand is called **type inference**: the type is still fixed, still
known, still checked; only the ceremony of writing it out is optional.

Push one step further — what actually happens if either variable is
reassigned to a different *kind* of value? First, the explicitly-typed
version:

```csharp
string message = "hello";
message = 5;
Console.WriteLine(message);
```

Real output, captured this session:

```
Program.cs(2,11): error CS0029: Cannot implicitly convert type 'int' to 'string' [.../LabScratch/LabScratch.csproj]

The build failed. Fix the build errors and run again.
```

The program never even started running — the compiler refused to build it
at all. Now the exact same experiment on a `var`-declared version:

```csharp
var message = "hello";
message = 5;
Console.WriteLine(message);
```

Real output, captured this session:

```
Program.cs(2,11): error CS0029: Cannot implicitly convert type 'int' to 'string' [.../LabScratch/LabScratch.csproj]

The build failed. Fix the build errors and run again.
```

The identical error, at the identical position. This is the proof that
`var` is not a loophole around static typing, the way it might look coming
from a dynamically-typed language: the compiler decided, once, at the
`var message = "hello";` line, that `message`'s type is permanently
`string` — and enforced that decision on the very next line exactly as
strictly as the explicit version did.

### Discard the Throwaway Example

Every line above is deleted from `LabScratch`; none of it — including the
two deliberately broken versions — becomes part of `ToolDB`.

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule, no external application
  was searched for or read while writing this lesson.
- **Files affected** — `Program.cs`, modified.
- **Change type** — replace (the single `Console.WriteLine("Hello, World!");`
  line from Lesson 0 is replaced entirely).
- **Location** — the whole file; Lesson 0 left exactly one line here.
- **Dependencies** — the `ToolDB` project and its restored
  `Microsoft.Data.Sqlite` package, both from Lesson 0.

### The New Code

```csharp
string connectionString = "Data Source=tools.db";
```

### The Updated Project

This one line *is* the entire file at this checkpoint — Lesson 0's single
line is gone, and nothing else has been added yet:

```csharp
string connectionString = "Data Source=tools.db";
```

Building this now produces a real, honest warning rather than a silent
success:

```
dotnet build
```

Real output, captured this session:

```
Program.cs(1,8): warning CS0219: The variable 'connectionString' is assigned but its value is never used [.../ToolDB/ToolDB.csproj]
  ToolDB -> .../ToolDB/bin/Debug/net10.0/ToolDB.dll

Build succeeded.

    1 Warning(s)
    0 Error(s)
```

This is the compiler being genuinely useful, not broken: `connectionString`
is declared and assigned, but nothing in the program reads it yet — exactly
true at this exact checkpoint, and exactly what the next Concept Unit
fixes by finally putting it to use. This warning is not part of the
finished lesson; it exists honestly, right now, because the file really is
incomplete right now.

### Mechanical Walkthrough

- `string` — the explicit type name, written before the variable name,
  from the Terms glossary above. It tells the compiler, once and
  permanently for this variable, exactly what kind of value
  `connectionString` is allowed to hold.
- `connectionString` — the variable's identifier (its name) — ordinary
  naming, the same concept as any Python variable name, chosen here to
  describe what the value represents.
- `=` — assignment, giving the newly declared variable its initial value;
  the same operator meaning as Python's `=`, no new behavior here.
- `"Data Source=tools.db"` — a string literal, the same kind of construct
  as Lesson 0's `"Hello, World!"`, given full treatment again here per
  this schema's Repetition Rule: a fixed sequence of characters written
  directly in the source, evaluated to exactly the text between the
  quotes. Its *content* — what `Data Source` means to
  `Microsoft.Data.Sqlite` specifically — is this lesson's actual subject,
  covered next.

The string's content deserves its own real explanation, not just a
description of the syntax carrying it. `Data Source=tools.db` follows the
**connection string** format from the Terms glossary above: a single
`Keyword=Value` pair (more can follow, separated by `;`, though this one
needs only one). `Data Source` is the keyword naming the database file's
path; Microsoft's own connection-string reference, fetched this session,
states plainly that "SQLite treats paths relative to the current working
directory" unless an absolute path is given — `tools.db` here is relative,
meaning it resolves against wherever `ToolDB.exe` is actually run from.
No `Mode=` keyword is written at all — the same reference documents that
`Mode` defaults to `ReadWriteCreate`, meaning "open for reading and
writing, and create the file if it doesn't already exist" — exactly the
behavior the next Concept Unit proves for real, not because this lesson
asked for creation explicitly, but because that's what happens when
nothing overrides the documented default.

### CS Lens

Not a hard concept in the design-pattern sense on its own, but worth
naming plainly: static type checking is a form of catching a whole class
of bugs — "this value is the wrong kind of thing" — at compile time,
before the program ever runs, rather than as a runtime crash discovered
only when that exact line happens to execute with that exact bad value.
Also recognized in: TypeScript layered on top of dynamically-typed
JavaScript, Rust's famously strict compiler, Java's checked types, and
(going the other direction) Python's own optional type hints — an
increasingly common retrofit of this same idea onto a language that didn't
originally have it.

### SE Lens

Why does C# require this ceremony — writing (or inferring) a type for
every variable — when Python gets by without it? The alternative not
chosen, dynamic typing, trades away compile-time checking for less typing
and more flexibility: a Python function can accept literally anything and
find out at runtime whether that was a mistake. C#'s bet is the opposite —
that catching "you passed the wrong kind of thing" as a build failure,
before any code ships or runs, is worth the extra syntax, especially as a
codebase and its number of contributors grow. The real cost this lesson's
reader is taking on directly: more to type, and — as this exact reader's
background makes especially relevant — a genuine new habit to build,
since Python never required or even offered this discipline in the same
form.

### Commands Needed

- `dotnet run` — reappearing from Lesson 0: builds the project (restoring
  first if needed) and immediately executes the resulting program,
  streaming its console output back to the terminal; used here to run
  each throwaway experiment in `LabScratch` in turn.
- `dotnet build` — reappearing from Lesson 0: compiles the project without
  running it, printing every warning and error found; used here
  specifically to observe the honest `CS0219` warning above without also
  needing the (currently pointless) act of running the half-finished
  program.

### Run It — Real Output

Already shown above: the `LabScratch` experiments ran and printed real
output, including two real compiler errors; `ToolDB`'s own
`dotnet build` produced the real `CS0219` warning shown above. This
checkpoint's code cannot run to any meaningful output on its own yet — it
only declares a variable nothing reads — which is exactly what the next
Concept Unit connects to.

### Connecting Back

`connectionString` now exists, statically typed, holding real connection
information as plain text. The next unit is what actually reads it.

---

## Concept Unit: Opening a Connection — `SqliteConnection`, `Open()`, and Proving a File Appears

### The Problem

A connection string, from the previous unit, is just text — nothing has
touched the disk yet, and nothing SQLite-specific has run at all. How does
that text actually turn into a live link to a real file, and — since
"SQLite creates the file" is exactly the kind of claim this schema doesn't
let stand on prose alone — how would a reader actually *prove*, rather
than trust, that a file gets created for a path that doesn't exist yet?

### Introduce the Concept in Isolation

Back in `LabScratch`, with `Microsoft.Data.Sqlite` already installed from
Lesson 0's own verification:

```csharp
using Microsoft.Data.Sqlite;

Console.WriteLine($"File exists before: {File.Exists("lab.db")}");

var connection = new SqliteConnection("Data Source=lab.db");
Console.WriteLine($"State before Open(): {connection.State}");

connection.Open();
Console.WriteLine($"State after Open():  {connection.State}");
Console.WriteLine($"File exists after Open(): {File.Exists("lab.db")}");
Console.WriteLine($"File size in bytes: {new FileInfo("lab.db").Length}");

connection.Close();
Console.WriteLine($"State after Close(): {connection.State}");
```

Real output, captured this session:

```
File exists before: False
State before Open(): Closed
State after Open():  Open
File exists after Open(): True
File size in bytes: 0
State after Close(): Closed
```

This proves, rather than assumes, several things at once. `lab.db`
genuinely did not exist before this code ran, and genuinely does exist
immediately after `Open()` — nothing else in this program was capable of
creating it. `.State` faithfully tracks the connection's own lifecycle:
`Closed` before any call, `Open` immediately after `Open()`, `Closed`
again after `Close()` — a live readout, not a value fixed once at
construction. And the file, while genuinely present, is `0` bytes —
`Open()` created an empty placeholder at the right path, but not yet a
populated SQLite database with any real internal structure. SQLite defers
writing its actual on-disk format (page headers, schema) until the first
time something is actually written into the file — which nothing in this
lesson does yet; that structure appears once a later lesson gives this
file its first table.

Microsoft's own documentation for `Open()`, fetched this session, states
exactly why the file appeared, quoted verbatim: "If `Mode=ReadWriteCreate`
is used (the default) the file is created, if it doesn't already exist."
This connection string named no `Mode=` keyword at all — it used that
documented default, proven here rather than assumed.

### Discard the Throwaway Example

`lab.db` and every line of code above are discarded; none of it becomes
part of `ToolDB`.

### Project Change

- **Reference Source** — no reference counterpart consulted this session.
- **Files affected** — `Program.cs`, modified.
- **Change type** — add.
- **Location** — after the `connectionString` declaration added in the
  previous unit.
- **Dependencies** — the `connectionString` variable and the
  `Microsoft.Data.Sqlite` package, both already present.

### The New Code

```csharp
using Microsoft.Data.Sqlite;
```

and, below the existing `connectionString` line:

```csharp
var connection = new SqliteConnection(connectionString);
connection.Open();

Console.WriteLine($"Connected. State: {connection.State}");
Console.WriteLine($"Database file on disk: {File.Exists("tools.db")}");

connection.Close();
```

### The Updated Project

Full `Program.cs`, new lines marked:

```csharp
using Microsoft.Data.Sqlite;                                             // ← new

string connectionString = "Data Source=tools.db";

var connection = new SqliteConnection(connectionString);                 // ← new
connection.Open();                                                       // ← new

Console.WriteLine($"Connected. State: {connection.State}");              // ← new
Console.WriteLine($"Database file on disk: {File.Exists("tools.db")}");  // ← new

connection.Close();                                                      // ← new
```

The file now does everything this lesson set out to prove: build a
connection string, open a real connection against it, print live proof of
both the connection's state and the file's existence, then release the
connection manually. Nothing here yet guards against an exception
happening between `Open()` and `Close()` — that gap is exactly what the
next unit closes.

### Mechanical Walkthrough

- `using Microsoft.Data.Sqlite;` — a **using directive** (Terms glossary
  above): imports the `Microsoft.Data.Sqlite` namespace so
  `SqliteConnection` can be referred to by its short name below, instead
  of writing `Microsoft.Data.Sqlite.SqliteConnection` in full every time.
  This is genuinely new: Lesson 0's `<ImplicitUsings>enable</ImplicitUsings>`
  setting only auto-imports a standard set of common namespaces (`System`
  among them, which is why `Console` never needed one) — `Microsoft.Data.Sqlite`
  isn't in that standard set, since it's a third-party package, not part
  of the base class library.
- `var connection = new SqliteConnection(connectionString);` — `var`
  infers `connection`'s type as `SqliteConnection`, the exact type
  inference proven for real in the previous unit. `new SqliteConnection(connectionString)`
  calls the constructor from the Objects/methods section above, passing
  the connection string built in the previous unit.
- `connection.Open();` — the method call from the Objects/methods section
  above; proven, in this unit's isolated lab, to both establish a live
  connection and create the underlying file if it doesn't exist yet.
- `Console.WriteLine($"Connected. State: {connection.State}");` —
  reappearing `Console.WriteLine`, given full treatment in the trailing
  "Everything else" section above. New here: **string interpolation** — a
  `$"..."` string literal where anything inside `{ }` is evaluated and its
  result substituted into the string at that point, instead of needing
  separate concatenation (`"Connected. State: " + connection.State`).
  `connection.State` reads the property explained above.
- `Console.WriteLine($"Database file on disk: {File.Exists("tools.db")}");`
  — the same string-interpolation syntax, this time embedding a call to
  `File.Exists`, explained above, which returns a `bool` that interpolates
  as the literal text `True` or `False`.
- `connection.Close();` — the method call from the Objects/methods section
  above, releasing the connection manually — the specific gap the next
  unit exists to close.

### CS Lens

Not a hard concept in the design-pattern sense — straightforward API
usage. Worth naming once: reading a live `.State` property to observe an
object's own lifecycle from the outside, rather than trusting an
assumption about what a method "must have done," is the same idea behind
assertions in automated tests and health-check endpoints in running
services — verify observable state, don't just trust that code ran
correctly.

### SE Lens

Why does `SqliteConnection` expose `.State` as a live, re-readable
property, instead of just letting `Open()`/`Close()` throw if misused and
otherwise staying silent about everything else? The alternative not
chosen — an API surface that only ever throws or succeeds, with no way to
ask "what state are you in right now" — makes debugging a stuck or
misused connection much harder: without observable state, a caller has to
reconstruct that state mentally by tracking every method call it made,
which breaks down the moment the object is passed between methods or a
failure surfaces somewhere else in the call stack. Exposing state as data,
not only as a sequence of side-effecting calls, is exactly what let this
lesson prove its own explanations with real printed output instead of
asserting them.

### Commands Needed

- `dotnet run` — reappearing: builds the project (restoring first if
  needed) and executes it, streaming output back to the terminal; used
  here to run each isolated lab and, later, the real `ToolDB` program.
- `dotnet build` — reappearing: compiles without running, reporting
  warnings and errors; used here to confirm this checkpoint builds
  cleanly before running it.

### Run It — Real Output

```
dotnet build
```

Real output, captured this session, from inside `ToolDB/`:

```
Determining projects to restore...
All projects are up-to-date for restore.
ToolDB -> .../ToolDB/bin/Debug/net10.0/ToolDB.dll

Build succeeded.
    0 Warning(s)
    0 Error(s)
```

The `CS0219` warning from the previous unit is gone — `connectionString`
is finally read, by the `SqliteConnection` constructor. Then:

```
dotnet run
```

Real output, captured this session:

```
Connected. State: Open
Database file on disk: True
```

### Connecting Back

The connection string built in the previous unit is what this unit's
`SqliteConnection` was actually constructed from — proven, not assumed,
by the real `tools.db` file this run just created. The next unit closes
this checkpoint's one remaining gap: nothing yet guarantees `connection.Close();`
actually runs if something goes wrong before it.

---

## Concept Unit: Resource Lifetime — `IDisposable`, the `using` Declaration, and What "Closed" Actually Means

### The Problem

The previous unit's real project code calls `connection.Close()` as the
very last line — but only if every line before it runs successfully. What
happens to that open connection, and the OS-level file lock it holds, if
something throws an exception between `Open()` and that final `Close()`?
And once a connection genuinely is closed or disposed, does that mean the
OS file handle behind it is actually, immediately, released back to the
operating system — or is that still an assumption worth checking instead
of trusting?

### Introduce the Concept in Isolation

First, prove the danger this unit exists to prevent — a lock that
outlives a forgotten `Close()`. In `LabScratch`:

```csharp
using Microsoft.Data.Sqlite;

var connection = new SqliteConnection("Data Source=lock.db");
connection.Open();
Console.WriteLine($"Connection open. State: {connection.State}");

try
{
    File.Delete("lock.db");
    Console.WriteLine("Delete succeeded while connection was open.");
}
catch (IOException ex)
{
    Console.WriteLine($"Delete failed while connection was open: {ex.Message}");
}
```

Real output, captured this session:

```
Connection open. State: Open
Delete failed while connection was open: The process cannot access the file '...\lock.db' because it is being used by another process.
```

This is a **file lock**, proven rather than described: while `connection`
is open, the operating system itself — not .NET, not SQLite's own logic —
refuses to let this same process delete the file out from under the open
handle. This exact `IOException` is what "resource lifetime matters"
concretely looks like when ignored.

Does calling `Dispose()` fully clear that lock immediately? Continue the
same lab:

```csharp
connection.Dispose();
Console.WriteLine($"Connection disposed. State: {connection.State}");

try
{
    File.Delete("lock.db");
    Console.WriteLine("Delete succeeded after Dispose().");
}
catch (IOException ex)
{
    Console.WriteLine($"Delete failed after Dispose(): {ex.Message}");
}
```

Real output, captured this session:

```
Connection disposed. State: Closed
Delete failed after Dispose(): The process cannot access the file '...\lock.db' because it is being used by another process.
```

This is a genuinely surprising result, worth taking seriously rather than
explaining away: `.State` honestly reports `Closed`, and yet the file is
still locked. This isn't a bug in `Dispose()` — it's **connection
pooling** (Terms glossary above), and Microsoft's own documentation for
connection strings, fetched this session, confirms it's on by default,
quoted verbatim: "Pooling — A value indicating whether the connection
will be pooled ... True: The connection will be pooled. This is the
default." `Dispose()` returned the connection's underlying native handle
to an internal pool for possible reuse — a real performance optimization,
not a broken promise — instead of tearing it down immediately. Proving
the pool specifically is responsible, not something else:

```csharp
SqliteConnection.ClearAllPools();
Console.WriteLine("Called SqliteConnection.ClearAllPools().");

try
{
    File.Delete("lock.db");
    Console.WriteLine("Delete succeeded after ClearAllPools().");
}
catch (IOException ex)
{
    Console.WriteLine($"Delete failed after ClearAllPools(): {ex.Message}");
}
```

Real output, captured this session:

```
Called SqliteConnection.ClearAllPools().
Delete succeeded after ClearAllPools().
```

The delete succeeds only once every pooled native handle is actually torn
down — confirming pooling, specifically, was holding the lock, not a leak
or a mistake anywhere in this code. The practical lesson this proves: in
ADO.NET, "disposed" means "returned for possible reuse, and no longer
usable through this particular `SqliteConnection` object" — not "the
operating system has definitely let go of this file this instant." For
`ToolDB`'s own code this rarely matters (nothing in this project currently
needs to rename or delete `tools.db` out from under itself); it's flagged
here, honestly, because asserting `Dispose()` "releases the resource"
without this caveat would be exactly the kind of unverified claim this
schema doesn't allow to stand.

Now, separately, prove what `using` actually guarantees — not instant OS
release (already shown above to be pooling's business, not `using`'s), but
that `Dispose()` reliably *runs at all*, even when an exception interrupts
the code before it ever reaches a normal `Close()`/`Dispose()` call:

```csharp
using Microsoft.Data.Sqlite;

SqliteConnection? connection = null;
try
{
    using (connection = new SqliteConnection("Data Source=crash.db"))
    {
        connection.Open();
        Console.WriteLine($"State inside try, before throw: {connection.State}");
        throw new InvalidOperationException("Simulated failure mid-operation");
    }
}
catch (InvalidOperationException ex)
{
    Console.WriteLine($"Caught: {ex.Message}");
}

Console.WriteLine($"State after the exception was caught: {connection.State}");
```

Real output, captured this session (one real compiler warning included,
explained below the output):

```
Program.cs(18,60): warning CS8602: Dereference of a possibly null reference. [.../LabScratch/LabScratch.csproj]
State inside try, before throw: Open
Caught: Simulated failure mid-operation
State after the exception was caught: Closed
```

The warning first: `connection` was declared as `SqliteConnection?` (the
`?` marking it nullable), so the compiler's nullable-reference analysis —
`<Nullable>enable</Nullable>` from Lesson 0's project file — correctly
flags that the final line reads `.State` without first proving
`connection` isn't `null`. It's a real, honest warning, not an error: this
lab's own logic guarantees `connection` was assigned before that line
runs, but the compiler's static analysis can't see that guarantee just
from the code's shape — a genuine limit of nullable analysis worth seeing
once, honestly, rather than only reading about in the abstract.

The actual proof: nothing after `throw` on that line ever ran — no line
reads "reached the end of the using block normally." And yet
`connection.State` reads `Closed` afterward. The only thing that could
have called `Dispose()` is the `using` block itself, reacting to the
exception unwinding past it — proven, not assumed. Microsoft's own C#
language reference, fetched this session, states the guarantee this
proves directly, quoted verbatim: "the `using` statement ensures that a
disposable instance is disposed even if an exception occurs within the
block of the `using` statement." This is the **using statement** (the
block form, `using (...) { }`) — and the shorter **using declaration**
form (`using var x = ...;`, with no braces at all) makes the identical
guarantee, disposing at the end of whatever scope it's declared in, per
that same official reference.

### Discard the Throwaway Example

`lock.db`, `crash.db`, and every line of the labs above are discarded;
none of it becomes part of `ToolDB`.

### Project Change

- **Reference Source** — no reference counterpart consulted this session.
- **Files affected** — `Program.cs`, modified.
- **Change type** — replace.
- **Location** — replaces the `var connection = new SqliteConnection(connectionString);`
  line and the trailing `connection.Close();` line, both added in the
  previous unit; every line between them is unchanged.
- **Dependencies** — the connection-opening code added in the previous
  unit.

### The New Code

```csharp
using var connection = new SqliteConnection(connectionString);
```

(the trailing `connection.Close();` line is deleted entirely — no longer
needed)

### The Updated Project

Full `Program.cs`, with the change marked:

```csharp
using Microsoft.Data.Sqlite;

string connectionString = "Data Source=tools.db";

using var connection = new SqliteConnection(connectionString);           // ← changed: added "using"
connection.Open();

Console.WriteLine($"Connected. State: {connection.State}");
Console.WriteLine($"Database file on disk: {File.Exists("tools.db")}");
```

The program now does everything the previous unit's version did, minus
one real gap: however the program ends — normally, falling off the end of
the file, or via an exception nothing here currently throws —
`connection`'s `Dispose()` is guaranteed to run, proven by this unit's own
`crash.db` lab, applied here to the real project instead of a throwaway.

### Mechanical Walkthrough

- `using var connection = new SqliteConnection(connectionString);` — a
  **using declaration** (Terms glossary above): the leading `using`
  keyword, immediately before a variable declaration, ties `connection`'s
  disposal to the end of its enclosing scope — here, a top-level-statements
  file, so that scope is "the rest of the program." `var` and
  `new SqliteConnection(connectionString)` are unchanged from the previous
  unit's full explanation. Microsoft's own C# reference, fetched this
  session, adds one more real constraint worth stating plainly: "A
  variable declared by the using statement or declaration is readonly. You
  can't reassign it" — `connection` can never be pointed at a different
  `SqliteConnection` object after this line, specifically because doing so
  would create ambiguity about which object `Dispose()` is actually meant
  to run against at the end of scope.
- The manual `connection.Close();` this replaces is deleted entirely, not
  left alongside the new line — calling `Close()` and then letting `using`
  call `Dispose()` again isn't an error (`SqliteConnection` tolerates being
  closed twice), but it's redundant ceremony this construct exists
  specifically to remove.

### CS Lens

Guaranteeing cleanup code runs regardless of how a block of code exits —
normally, or via an exception — is a hard concept worth naming by
pattern, not just as one language's syntax: this is C#'s expression of
**RAII (Resource Acquisition Is Initialization)**, the same underlying
idea C++'s destructors and Python's `with` statement each implement, with
their own syntax. Also recognized in: Java's `try`-with-resources, Rust's
`Drop` trait running automatically when a value goes out of scope, Go's
`defer`. Every one of these answers the identical question — "how do I
guarantee this cleanup code runs no matter how this block of code exits" —
independently arrived at by nearly every general-purpose language with
resources to manage.

### SE Lens

Why does C# offer `using` at all, instead of just requiring every
disposable object to be wrapped in a manual
`try { ... } finally { thing.Dispose(); }`? The alternative not chosen —
bare `try`/`finally` everywhere — isn't wrong; it's exactly what `using`
compiles down to. It's a real cost in practice, though: it's easy to
forget the `finally` block entirely, especially when a method gets edited
later and a new early-return or new exception path is added without
anyone remembering to check whether every disposable object it touches is
still covered by a `finally`. `using` (either form) makes that omission
structurally hard to make — the disposal is attached to the declaration
itself, so there's no separate cleanup block sitting elsewhere to forget
to update. The real cost this project is still accepting: nothing stops a
future edit from declaring a new `SqliteConnection` *without* `using` by
mistake — the compiler enforces `IDisposable`-ness of whatever's passed to
`using`, but it can't force a programmer to reach for `using` in the first
place.

### Commands Needed

- `dotnet run` — reappearing: builds and executes, streaming output back;
  used here to run this unit's labs and the final real `ToolDB` program.
- `dotnet build` — reappearing: compiles without running; used here to
  confirm the final version still builds warning-free.

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
```

Identical output to the previous unit's checkpoint — proving this unit's
change is genuinely behavior-preserving on the success path; the real
difference it adds only shows up on a path that fails partway through,
demonstrated next in this lesson's Closing section.

### Connecting Back

The connection opened in the previous unit is the exact object this
unit's `using` now guarantees gets released, on every path this program
could take from here — proven, not assumed, by this unit's own `crash.db`
experiment, structurally identical to what protects `ToolDB`'s real code
now.

---

## Closing

### Connect the Pieces

One trace, start to finish, using only what actually ran on this machine
this session. The first Concept Unit's
`string connectionString = "Data Source=tools.db";` is a statically-typed
variable — proven for real: reassigning it to a non-`string` value is a
compile error, `CS0029`, whether declared explicitly or via `var` — holding
a connection string: plain text a driver parses, not yet touching disk.
The second unit's `new SqliteConnection(connectionString)` builds a
connection object around that exact text; its `.Open()` call is what turns
that text into a real, live link — proven, by `File.Exists` before and
after, to also be the exact moment `tools.db` is created on disk (empty,
per SQLite's own deferred-write behavior, confirmed by checking its real
byte size). The third unit's `using`, wrapping that same `connection`
variable, guarantees `Dispose()` runs at the end of the program's scope no
matter how it gets there — proven by deliberately throwing an exception
mid-operation and watching `.State` read `Closed` afterward anyway — and
that same unit's `ClearAllPools()` experiment proved, honestly, that
"disposed" and "the OS file handle is gone this instant" are two different
claims, not one, because of connection pooling. Change any one link — an
untyped variable that could silently hold the wrong thing, a connection
string pointing nowhere real, a `Close()` that never runs because an
exception skipped past it — and the next link has nothing valid to build
on.

### What Breaks Without This

Temporarily change the connection string to point somewhere that can't
possibly exist:

```csharp
string connectionString = "Data Source=Z:\\this\\path\\does\\not\\exist\\tools.db";
```

Run it:

```
dotnet run
```

Real output, captured this session:

```
Unhandled exception. Microsoft.Data.Sqlite.SqliteException (0x80004005): SQLite Error 14: 'unable to open database file'.
   at Microsoft.Data.Sqlite.SqliteException.ThrowExceptionForRC(Int32 rc, sqlite3 db)
   at Microsoft.Data.Sqlite.SqliteConnectionInternal..ctor(SqliteConnectionStringBuilder connectionOptions, SqliteConnectionPool pool)
   at Microsoft.Data.Sqlite.SqliteConnectionPool.GetConnection()
   at Microsoft.Data.Sqlite.SqliteConnectionFactory.GetConnection(SqliteConnection outerConnection)
   at Microsoft.Data.Sqlite.SqliteConnection.Open()
   at Program.<Main>$(String[] args) in .../ToolDB/Program.cs:line 6
```

This is `Open()` failing loudly and specifically — `SqliteException`,
SQLite's own native error code 14, "unable to open database file" —
instead of silently doing nothing. The stack trace's last line,
`Program.<Main>$`, is the exact compiler-generated entry-point method
Lesson 0 proved exists underneath every top-level-statements file — this
exception is unhandled precisely because nothing in this small a program
catches it, so it propagates all the way out of that generated `Main`
method and crashes the process. Restore the correct connection string
(`"Data Source=tools.db"`) before continuing — nothing later in this
lesson depends on having broken it.

### Exercises

- Re-run the pooling lab from the third Concept Unit yourself, but skip
  the `SqliteConnection.ClearAllPools()` call entirely — confirm for
  yourself that `File.Delete` keeps failing indefinitely without it.
- Change `ToolDB`'s connection string to `"Data Source=:memory:"` — an
  in-memory database, confirmed as a real supported `Data Source` value
  per Microsoft's own documentation fetched this session — and run it.
  Predict what `File.Exists("tools.db")` will print before running it,
  then check whether the prediction was right, and explain why in one
  sentence.
- Add a second `Console.WriteLine(connection.State);` immediately after
  the `using var` line, before `Open()` is called. Confirm it reads
  `Closed` — proof the connection object exists in memory before `Open()`
  ever runs; construction and opening are two separate steps, not one.

### Definition of Done

- [ ] `ToolDB/Program.cs` builds with `dotnet build` at 0 warnings, 0
      errors.
- [ ] `dotnet run` prints `Connected. State: Open` and
      `Database file on disk: True`.
- [ ] A `tools.db` file exists in the project folder after running,
      confirmed for real rather than assumed.
- [ ] The "what breaks" experiment above was actually run, the real
      `SqliteException` was seen, and the connection string was restored
      to `"Data Source=tools.db"` afterward.
- [ ] A git commit exists containing the updated `Program.cs`, with a
      message explaining *why* (a connection is now opened and safely
      released on every code path, not just "add database connection").

Next lesson: **Lesson 2 — Schema Design**, giving `tools.db` its first
real table — the moment this lesson's empty, 0-byte file finally gets
real SQLite structure written into it.
