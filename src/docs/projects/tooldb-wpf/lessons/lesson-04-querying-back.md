# Lesson 4: Turning Rows Into Objects, and Making "Still Correct" Automatic
### (Querying Back)

**What you will build.** By the end of this lesson, `ToolDB` reads its own
data back instead of only writing it: the single row Lesson 3 inserted into
`tools.db` gets pulled back out through a `SELECT`, walked row by row through
a real forward-only cursor, and turned into this project's first-ever
user-defined type — a `Tool` object, built by this project's first-ever
user-written method. That's the first half. The second half exists because
the first half raises an honest question: every verification this curriculum
has done so far has been "run the program, read what it printed, trust your
own eyes." That works for one lesson's worth of code. It does not work once
a project has four lessons' worth of code that all have to keep working
*together* — a human re-reading console output after every future change,
forever, doesn't scale and doesn't stay honest. So this lesson also writes
`ToolDB`'s first **automated test**: a second, independent program whose
only job is to check that `Tool`'s row-mapping logic still does exactly what
it's supposed to, every time it's asked, without anyone reading a
transcript. The Closing proves why that matters by breaking the mapping
logic in a way a human skimming console output could easily miss — and
showing the test catch it anyway.

**What you need to know first.** Lesson 1 — `SqliteConnection`, `.Open()`,
`using` declarations, connection state, string interpolation, static typing.
Lesson 2 — `SqliteCommand`, `sqlite_schema`, type affinity, `PRIMARY KEY`/
`rowid`. Lesson 3 — `SqliteParameter`, parameter binding, and the exact
`tools` table and single real row (`"1/2 in 4-Flute Carbide End Mill"`,
manufacturer `"O'Brien Carbide Tools"`) this lesson reads back. This lesson
reuses the same open `connection` Lesson 1 established and never runs
`CREATE TABLE` or `INSERT` again — `tools.db`'s schema and its one row
already exist permanently on disk.

**Terms used in this lesson**

- **cursor** — a position marker into a result set that a program advances
  one row at a time, rather than receiving the whole result set as a single
  in-memory collection up front. It exists because a `SELECT` can match
  millions of rows; a cursor lets a program process them one at a time,
  using a small, constant amount of memory no matter how large the result
  set is, instead of forcing the entire result into memory before any of it
  can be used.
- **iteration (cursor-driven)** — the specific pattern this lesson's reader
  uses: repeatedly calling one method that both *advances* the cursor to the
  next row and *reports*, via its own return value, whether a next row
  existed at all. This is a different shape than a Python `for item in
  collection:` loop, which iterates over a collection that's already fully
  present — here, there is no collection; each call to the advancing method
  is what causes the next row to exist for the program at all.
- **ordinal** — a column's position within a result set, counted from `0`
  for the first selected column, `1` for the second, and so on, in exactly
  the order the `SELECT` statement listed them. It exists because a result
  set's columns aren't named slots at the CLR level — they're indexed ones,
  the same way a Python list is indexed by position rather than by name.
- **class** — a blueprint that declares what shape a category of object has
  (what named pieces of data it holds, what it can do) without itself being
  any one specific object. Lesson 2's own CS Lens already named the general
  split this recreates: `CREATE TABLE` declares a shape once, `INSERT`
  places real rows into that shape as many times as needed. A `class` is the
  exact same split, moved from SQL's type system into C#'s: it declares a
  shape once, and any number of independent objects can be built from it
  afterward.
- **object (instance)** — one concrete thing built from a class's blueprint,
  occupying its own space in memory, holding its own values for whatever the
  class declared. Two objects built from the same class share the same
  *shape* — the same named properties — but never share the same *values*
  unless something makes them, the same way two rows in the same table share
  a schema but not their own data.
- **property** — a named, typed piece of data a class declares its objects
  will hold, written here as `public string Name { get; set; }`. It exists
  as C#'s answer to "a variable that belongs to an object rather than to one
  method's local scope" — Lesson 1 through Lesson 3's variables all
  disappeared the moment the method holding them finished; a property's
  value lives as long as the object holding it does.
- **object initializer** — the `new ClassName { Property = value, ... }`
  syntax used to build an object and assign several of its properties in one
  expression, rather than building it first and assigning each property on a
  separate following line. It exists purely for convenience — it compiles
  down to the same property assignments written out one at a time — but it
  keeps "here is everything this new object starts out holding" visually
  together as one unit instead of scattered across several statements.
- **access modifier** — a keyword controlling which other code is allowed to
  see or use a given type or member. C# gives an unmarked top-level type
  `internal` visibility by default — visible only within the same compiled
  assembly (roughly, the same project) — without ever printing the word
  `internal` anywhere; marking something `public` instead extends that
  visibility to any other assembly that references this one. This matters
  the moment a second project (this lesson's own test project) needs to see
  a type the first project declared.
- **method** — a named, reusable block of code with a declared return type
  and a declared parameter list, callable by name instead of being retyped
  everywhere it's needed. Python already has this exact idea (`def`); what's
  new here is C#'s own shape for it — an explicit return type before the
  name, explicit types on every parameter, and, unlike a free-floating
  Python function, a method is always declared as a member of some class.
- **`static` (member)** — a method or property that belongs to the class
  itself, callable as `ClassName.MemberName(...)`, rather than to any one
  object built from that class. It exists for exactly the situation this
  lesson hits: building the *first* `Tool` from a database row, where no
  `Tool` object exists yet to call a method *on* — a `static` method can run
  before any instance of its own class does.
- **factory method** — a `static` method whose entire job is constructing
  and returning a new object, used in place of exposing the object's raw
  construction directly to every caller. Naming it is this lesson's own
  proof that "static method" and "factory method" aren't the same thing:
  `static` is the C# keyword that makes this possible; *factory method* is
  the name for the specific job this lesson's one static method does.
- **automated test** — a small, independent program that runs a piece of
  real code and checks, by comparison against a known-correct expected
  result, whether that code still behaves the way it's supposed to — with no
  human reading its output required to know pass from fail. It exists to
  replace exactly what every prior lesson in this curriculum has relied on:
  a person running `dotnet run` and reading the console by eye.
- **test project** — a separate, independent C# project whose only job is
  holding and running automated tests against another project's code, built
  and run on its own, never shipped as part of the real application. It's a
  second project for the same reason `LabScratch` and `ToolDB` are already
  two separate projects: keeping "code that verifies" structurally apart
  from "code that ships."
- **assertion** — a single statement inside a test that states a specific,
  checkable expectation and stops the test immediately, marking it failed,
  the moment that expectation isn't met. It's the actual mechanism that
  replaces "a human reads the output and judges whether it looks right" —
  the judgment is written down once, in code, ahead of time, instead of
  repeated by eye every run.
- **attribute** — a piece of metadata attached to a piece of code (here, a
  method) using `[Name]` syntax immediately above it, read by tooling rather
  than by the running program's own logic. `[Fact]`, this lesson's own
  example, is read by xUnit's test runner to discover which methods in a
  compiled assembly are tests worth running at all — nothing about the C#
  language itself treats a `[Fact]`-marked method specially; the meaning is
  entirely assigned by the tool that goes looking for it.
- **connection pooling** — reappearing from Lesson 1: `Microsoft.Data.Sqlite`
  keeps a closed connection's underlying native SQLite handle held open
  behind the scenes for a short time, ready to be reused by the next
  connection opened against the same file, rather than releasing it back to
  the operating system immediately. Lesson 1 proved this causes a file lock
  to outlive `Close()`; this lesson hits a second, genuinely different
  consequence of the exact same fact, in its own Concept Unit 5.

**Objects and methods used**

- **`SqliteCommand.ExecuteReader()`**
  - *What it is:* the method that runs a command's `SELECT` and hands back a
    live cursor over the results, instead of a single value
    (`ExecuteScalar()`, Lessons 2–3) or a row-count
    (`ExecuteNonQuery()`, Lessons 2–3).
  - *Implementation:* `public virtual Microsoft.Data.Sqlite.SqliteDataReader
    ExecuteReader();` (Microsoft's own reference, fetched this session) —
    returns a `SqliteDataReader`, below, and throws `SqliteException`
    (Lessons 1–3) "A SQLite error occurs during execution," per the same
    reference.
  - *Its use:* the one call, in this lesson's real checkpoint, that turns
    `tools`'s stored rows into something this program can actually walk
    through.
- **`SqliteDataReader`**
  - *What it is:* this lesson's own central subject — a forward-only cursor
    over one command's result rows, exposing both the "move to the next row"
    method and per-column typed readers.
  - *Implementation:* `public class SqliteDataReader : System.Data.Common.DbDataReader`
    (Microsoft's own reference, fetched this session) — inherits from
    ADO.NET's abstract `DbDataReader`, the same family `SqliteConnection`
    (Lesson 1, via `DbConnection`) and `SqliteCommand` (Lesson 2, via
    `DbCommand`) already belong to, so `SqliteDataReader` fits the identical
    "concrete SQLite implementation of a general ADO.NET abstraction"
    pattern already proven twice.
  - *Its use:* the object every row this lesson reads travels through,
    created once per `SELECT` and disposed via `using`, exactly like every
    `SqliteCommand`/`SqliteConnection` before it.
- **`SqliteDataReader.Read()`**
  - *What it is:* advances the cursor to the next row in the result set.
  - *Implementation:* `public override bool Read();` (Microsoft's own
    reference, fetched this session) — "`true` if there are more rows;
    otherwise, `false`," per the same reference, confirmed directly by this
    lesson's own first lab.
  - *Its use:* the condition of every `while (reader.Read())` loop this
    lesson writes — called once before the loop even starts being useful,
    and once more per row after, including the one final call that returns
    `false` and ends the loop.
- **`SqliteDataReader.GetInt32(int ordinal)` / `.GetString(int ordinal)` /
  `.GetDouble(int ordinal)`**
  - *What it is:* three sibling methods, each reading the current row's
    value at a given zero-based **ordinal**, above, as a specific CLR type.
  - *Implementation:* Microsoft's own reference (fetched this session)
    documents all three identically in shape: "Gets the value of the
    specified column as a `Int32`," "...as a `String`," "...as a `Double`" —
    each taking one `int ordinal` parameter, matching the override pattern
    already confirmed for `Read()` above.
  - *Its use:* every typed value this lesson pulls out of a row — `tools`'s
    `id`, `name`/`manufacturer`, and `overall_diameter`/`overall_length`
    respectively — read by position, in the exact order the `SELECT`'s own
    column list named them.

**Everything else in the file, not this lesson's subject but still
explained**

- **`SqliteCommand`**
  - *What it is:* reappearing from Lessons 2–3 — the class representing one
    SQL statement to be run against a database.
  - *Implementation:* `public class SqliteCommand : System.Data.Common.DbCommand`,
    established in Lesson 2, reused unchanged.
  - *Its use:* the vehicle for this lesson's own `SELECT`, exactly as for
    every `CREATE TABLE`/`INSERT` before it.
- **`SqliteConnection`**
  - *What it is:* reappearing from Lesson 1 — the class representing one
    open link to `tools.db`.
  - *Implementation:* `public class SqliteConnection : System.Data.Common.DbConnection`,
    established in Lesson 1.
  - *Its use:* the same `connection` variable opened once and reused for
    every command this lesson sends, exactly as in every prior lesson.
- **`SqliteParameter` / `SqliteCommand.Parameters.Add(...)`**
  - *What it is:* reappearing from Lesson 3 — a bound SQL value, and the
    call that attaches it to a command.
  - *Implementation:* established fully in Lesson 3: `public SqliteParameter(string
    name, object value)`; `Parameters` returns a `SqliteParameterCollection`
    whose `Add(SqliteParameter value)` places a parameter into it.
  - *Its use:* this lesson's own automated test (Concept Unit 5) builds its
    own tiny, throwaway `tools`-shaped table and inserts one known row into
    it using this exact safe technique — reused, not reinvented, for the
    test's own setup data.
- **`File.Exists(string? path)` / `File.Delete(string path)`**
  - *What it is:* reappearing from Lessons 1–3 — `static` methods on
    `System.IO.File`.
  - *Implementation:* established in Lesson 1; `File.Delete` established in
    Lesson 3's own workaround notes.
  - *Its use:* this lesson's automated test uses both, at the top of the
    test method, to guarantee it starts from a clean, nonexistent database
    file every run — the same "delete before, not after" pattern every
    throwaway lab in this curriculum has already used, and this lesson's own
    Concept Unit 5 explains exactly why "after" doesn't work here.
- **`Console.WriteLine(string?)`**
  - *What it is:* reappearing from Lesson 0 — a `static` method on
    `System.Console`.
  - *Implementation:* `public static void WriteLine(string? value)`,
    established in Lesson 0.
  - *Its use:* every observable proof this lesson's real project code
    produces (as opposed to its automated test, which needs no printing at
    all — its own point) is made visible through this same call.

---

## Concept Unit: Reading a Result Set Back — `SqliteDataReader` and the `Read()` Loop

### The Problem

`tools.db` holds one real row, placed there safely by Lesson 3. Every prior
lesson's own verification read that row back through `ExecuteScalar()` —
"give me the one value in the first column of the first row." That method
only ever makes sense when a result is known, in advance, to be exactly one
row and one column. A real query — "give me every tool in the shop" — can't
make that assumption: it might match one row, a thousand, or none, and the
program writing it doesn't know which until it actually runs. Getting more
than a single value back out of SQLite needs a genuinely different tool than
anything Lessons 1–3 have used.

### The New Code

In `LabScratch`, a fresh scratch file, `lab7.db`, seeded with three rows so
the loop below has more than one row to actually walk through:

```csharp
using Microsoft.Data.Sqlite;

if (File.Exists("lab7.db"))
{
    File.Delete("lab7.db");
}

using var connection = new SqliteConnection("Data Source=lab7.db");
connection.Open();

using var createCommand = new SqliteCommand("CREATE TABLE items (id INTEGER PRIMARY KEY, label TEXT)", connection);
createCommand.ExecuteNonQuery();

string[] labels = { "First", "Second", "Third" };
foreach (string label in labels)
{
    using var insertCommand = new SqliteCommand("INSERT INTO items (label) VALUES (@label)", connection);
    insertCommand.Parameters.Add(new SqliteParameter("@label", label));
    insertCommand.ExecuteNonQuery();
}

using var selectCommand = new SqliteCommand("SELECT id, label FROM items", connection);
using var reader = selectCommand.ExecuteReader();

Console.WriteLine($"Before any Read() call, reader.HasRows: {reader.HasRows}");

while (reader.Read())
{
    int id = reader.GetInt32(0);
    string label = reader.GetString(1);
    Console.WriteLine($"Row read: id={id}, label={label}");
}

Console.WriteLine("Loop finished — Read() returned false.");
```

Real output, captured this session:

```
Before any Read() call, reader.HasRows: True
Row read: id=1, label=First
Row read: id=2, label=Second
Row read: id=3, label=Third
Loop finished — Read() returned false.
```

This is a working **cursor**, from the Header above: `reader.HasRows` proves
rows exist before a single one has been visited, and each pass through the
`while` loop advances to exactly one new row and stops the instant there
isn't another. This whole pattern — a method that both advances *and*
reports whether it succeeded, driving a loop's own condition — is called
**cursor-driven iteration**.

### Discard the Throwaway Example

`lab7.db` and every line of the lab above are discarded; none of it becomes
part of `ToolDB`.

### Project Change

No changes to `ToolDB` from this unit. This unit only proves the reading
mechanism works in isolation — this lesson's fourth unit applies it for
real, once the shape to read *into* (this lesson's second and third units)
exists too.

### Mechanical Walkthrough

- `using var selectCommand = new SqliteCommand("SELECT id, label FROM items", connection);`
  — the same `SqliteCommand` constructor reused from Lessons 2–3, this time
  carrying a `SELECT` naming two columns explicitly, comma-separated:
  `id, label`. This is the same comma-separated naming pattern Lesson 3's
  own `INSERT INTO items (label)` column list already used — SQL reuses one
  shape (a comma-separated column list) for both "which columns am I
  supplying" (`INSERT`) and "which columns do I want back" (`SELECT`).
- `using var reader = selectCommand.ExecuteReader();` — the method call from
  the Header above, run for the first time this curriculum: `ExecuteReader()`
  sends the `SELECT` and immediately returns a live `SqliteDataReader`, from
  the Header above, *before* any row has actually been read — the query has
  run, but walking its results is a separate, following step.
- `Console.WriteLine($"Before any Read() call, reader.HasRows: {reader.HasRows}");`
  — `HasRows` is a property (not called with `()`) that reports, without
  moving the cursor at all, whether the result set contains at least one
  row; printed here specifically to prove the cursor already "knows" rows
  exist before `Read()` has ever been called once.
- `while (reader.Read())` — the method call from the Header above, used as a
  loop's own condition. Per the Header's Implementation entry, `Read()`
  returns `true` when it successfully advances to a new row, `false` the
  moment there isn't one; the `while` loop's ordinary meaning (reappearing
  from any prior Python loop the reader has written) — keep running the body
  as long as the condition is `true` — is what turns "advance one row" into
  "visit every row, then stop."
- `int id = reader.GetInt32(0);` — the method call from the Header above,
  reading the *current* row's column at **ordinal** `0` — the first column
  named in the `SELECT`'s list, `id` — as a `System.Int32`.
- `string label = reader.GetString(1);` — the identical pattern, ordinal
  `1` — the second named column, `label` — read as a `System.String`.
  Nothing about the reader itself knows these ordinals are called `id` and
  `label`; the mapping from position to meaning exists only because this
  code was written to match the `SELECT`'s own column order.
- `Console.WriteLine($"Row read: id={id}, label={label}");` — reappearing
  interpolation and `Console.WriteLine`, printing the current row's two
  values, run once per loop iteration.
- `Console.WriteLine("Loop finished — Read() returned false.");` — an
  ordinary string literal (no interpolation needed, nothing to substitute),
  printed once, only after the loop's own condition finally evaluates to
  `false`.

**Execution trace.** `while (reader.Read())` carries state — the cursor's
own position — across each pass, so a real trace of what happened, not a
paraphrase, is required:

1. `reader.Read()` → `true`; `id=1`, `label="First"` — the cursor's very
   first `Read()` call succeeds because `items` has three rows and none has
   been visited yet; SQLite returns them in `id` order by default (Lesson
   2's own `rowid`-aliasing `PRIMARY KEY` proof), so row `1` comes first.
2. `reader.Read()` → `true`; `id=2`, `label="Second"` — the second call
   succeeds for the same reason the first did: one more unvisited row still
   remains.
3. `reader.Read()` → `true`; `id=3`, `label="Third"` — the third and last
   row; nothing about this call looks different from the first two, because
   the cursor itself has no way to know in advance that this is the final
   row until it's asked once more.
4. `reader.Read()` → `false` — this fourth call is what actually reveals row
   `3` was the last one: there is no fourth row to advance to, so `Read()`
   reports failure instead of success, the `while` condition evaluates to
   `false`, and the loop body does not run a fourth time. This is the same
   call, with the same signature, as the first three — its return value is
   simply different this time, because the cursor's own position is
   different.

### CS Lens

Advancing a fixed position through a sequence one step at a time, stopping
only when an explicit "no more" signal appears, is a recurring shape, not
unique to database cursors. Also recognized in: Python's own iterator
protocol — a `for` loop over any iterable repeatedly calls `__next__()`
under the hood until it raises `StopIteration`, the same "keep calling until
told to stop" shape as `while (reader.Read())`, just spelled differently;
Python's own `sqlite3` module cursor object, which supports the identical
"keep fetching until nothing's left" idea this lesson's reader has just
learned, one layer lower, in C#; a `StreamReader.ReadLine()` call returning
`null` at end-of-file instead of another line; and Java's `Iterator`
interface, whose `hasNext()`/`next()` pair splits into two calls exactly
what `Read()` does in one.

### SE Lens

Why doesn't `ExecuteReader()` just hand back a ready-made `List<Tool>` with
every row already loaded, instead of a cursor a caller has to walk manually?
The alternative not chosen — eagerly load every matching row into memory
before returning anything — would remove this entire Concept Unit's own
`while` loop from every caller's code. But it would also mean a `SELECT`
matching a million rows allocates memory for all one million before a
caller can even look at the first one — memory usage that scales with the
size of the *query result*, not with how much of it the program actually
needs at once. A forward-only cursor costs exactly one row's worth of memory
at any moment, no matter how large the underlying result set grows — the
real tradeoff being paid for that: more code at every call site (this loop,
written out by hand) instead of a ready-made collection. Lesson 27's
multi-database-file aggregation and Lesson 28's network-share queries are
exactly the future situations where result sets can grow large enough for
this tradeoff to matter for real, not just in principle.

### Connecting Back

`tools.db`'s one real row can now be walked, one cursor step at a time, and
its two kinds of typed values — an `int` ordinal-`0` column, a `string`
ordinal-`1` column — read out correctly. What's still missing is somewhere
for those five real column values (`tools` has five beyond `id`) to
*live together* as one meaningful thing, instead of five loose local
variables a caller has to keep track of by convention. The next unit builds
exactly that shape.

---

## Concept Unit: A Class as a Shape for Data — Declaring a Type, Creating Objects

### The Problem

The previous unit can already read `id` as an `int` and `label` as a
`string`, one loose value at a time. `tools` has six columns; reading a real
tool would mean six separate local variables, every single place this
project ever needs to hold one — no name for "all six of these values,
together, are one tool," and nothing stopping two of those loose variables
from getting silently mixed up as this project grows. Every value this
curriculum has held so far — `connectionString`, `rowsAffected`,
`toolName` — has been exactly one piece of data with exactly one type. A
tool, the actual subject of this entire application, is not one piece of
data; it's several, that belong together.

### The New Code

Back in `LabScratch`, a throwaway `Widget` — deliberately not `Tool`, so
nothing about this lab becomes part of the real project by accident:

```csharp
class Widget
{
    public string Name { get; set; } = "";
    public int Count { get; set; }
}

var first = new Widget { Name = "Bolt", Count = 12 };
```

Typed and run exactly as shown, this fails to build:

```
Program.cs(7,1): error CS8803: Top-level statements must precede namespace and type declarations.
```

This is a real, genuine C# rule, not a mistake in the code's own logic: in a
file that mixes ordinary top-level statements (every line of code Lessons
0–3 have written) with a type declaration like `class Widget { ... }`, the
statements *must* come first, and every type declaration must come *after*
all of them. C# accepts exactly one implicit entry point per program — the
top-level statements — and that entry point has to be unambiguously
identifiable as "the code that runs first," which requires it to sit before
any type declaration in the same file. Moving the `class` below the
statements that use it fixes this:

```csharp
var first = new Widget { Name = "Bolt", Count = 12 };
var second = new Widget { Name = "Washer", Count = 40 };

Console.WriteLine($"first: Name={first.Name}, Count={first.Count}");
Console.WriteLine($"second: Name={second.Name}, Count={second.Count}");

first.Count = 99;
Console.WriteLine($"After changing first.Count: first.Count={first.Count}, second.Count={second.Count}");

class Widget
{
    public string Name { get; set; } = "";
    public int Count { get; set; }
}
```

Real output, captured this session:

```
first: Name=Bolt, Count=12
second: Name=Washer, Count=40
After changing first.Count: first.Count=99, second.Count=40
```

This proves two separate things. First, `first` and `second` are genuinely
independent **objects**, from the Header above, built from the same
**class** blueprint: changing `first.Count` to `99` leaves `second.Count`
still `40` — the two objects share a shape, never their actual values.
Second, the whole thing really did fail to compile with `class Widget`
placed first, and really did succeed once it moved after the statements
that use it — not a hypothetical rule, a rule this lab's own first attempt
tripped over for real.

### Discard the Throwaway Example

`Widget`, both versions of this lab, and every line above are discarded;
none of it becomes part of `ToolDB`. The real project sidesteps the whole
statements-before-types ordering question a different way, shown in this
lesson's fourth unit: a class declared in its *own* file never has
top-level statements to come after in the first place.

### Project Change

No changes to `ToolDB` from this unit. `Tool`, the real class this project
actually needs, is declared for real once its intended job — holding one
mapped row — has a caller ready to use it, in this lesson's fourth unit.

### Mechanical Walkthrough

- `class Widget { ... }` — a **class** declaration, from the Header above: a
  keyword, `class`, a name chosen by this lab's author, and a body in
  `{ }` listing what every `Widget` will hold. Nothing about writing this
  line creates a `Widget` — a class is a blueprint, inert until something
  builds from it.
- `public string Name { get; set; } = "";` — a **property**, from the
  Header above: `public`, the **access modifier** from the Header above,
  chosen here for consistency with the real `Tool` class this lab is
  rehearsing (this scratch `Widget` never actually needs cross-project
  visibility, but the real class does); `string Name` declares the
  property's name and type, the same type-then-name shape as every local
  variable this curriculum has already declared; `{ get; set; }` is C#'s
  **auto-implemented property** syntax — `get` allows reading the value
  back out, `set` allows assigning a new one, and the compiler builds the
  small piece of hidden storage backing both automatically, without this
  code ever declaring that storage itself; ` = "";` supplies a starting
  value (an empty string) so the property is never left holding nothing
  before an object initializer runs.
- `public int Count { get; set; }` — the identical pattern, an `int`
  property with no starting-value assignment; `int`'s own default value,
  `0`, applies automatically when none is given (matching Lesson 2's own
  `INTEGER` affinity default reasoning, one layer up in C#'s own type
  system instead of SQLite's).
- `var first = new Widget { Name = "Bolt", Count = 12 };` — `var`,
  reappearing from every prior lesson's local variable declarations, lets
  the compiler infer `first`'s type (`Widget`) from what's assigned to it,
  exactly as already established; `new Widget { ... }` is this lesson's
  **object initializer**, from the Header above: `new` allocates one real
  `Widget` object, and the `{ Name = "Bolt", Count = 12 }` block assigns
  both properties as part of that same expression, in one step, rather than
  across three separate lines (`var first = new Widget(); first.Name =
  "Bolt"; first.Count = 12;` would build the identical object, more
  verbosely).
- `var second = new Widget { Name = "Washer", Count = 40 };` — the identical
  pattern, building a second, entirely independent `Widget` object from the
  same class.
- `Console.WriteLine($"first: Name={first.Name}, Count={first.Count}");` —
  reappearing interpolation and `Console.WriteLine`; `first.Name` and
  `first.Count` are **property access** — reading a specific object's own
  stored value for a named property, using the same dot syntax already
  familiar from `connection.State` (Lesson 1) and `reader.HasRows` (this
  lesson's first unit) — proving those were never special cases, just this
  same mechanism used on framework objects instead of a project-defined one.
- `Console.WriteLine($"second: Name={second.Name}, Count={second.Count}");`
  — the identical pattern, reading `second`'s own values — different from
  `first`'s, despite both objects sharing the exact same class.
- `first.Count = 99;` — property access again, this time on the left side
  of an assignment: reassigns `first`'s own `Count` to a new value, using
  the `set` half of the auto-implemented property from above.
- `Console.WriteLine($"After changing first.Count: first.Count={first.Count}, second.Count={second.Count}");`
  — reappearing interpolation, printing both objects' `Count` values
  side by side — the line that actually proves independence: only `first`'s
  own value changed.

### CS Lens

Declaring a shape once, then creating many independent things that share it
without sharing their own values, is a recurring split this curriculum has
already named once, one layer down: Lesson 2's own CS Lens called out
exactly this shape for `CREATE TABLE` (structure, declared once) versus
`INSERT` (content, placed in as many times as needed) — Lesson 3's CS Lens
reused the identical framing for DDL versus DML generally. A `class`
declaration is that same idea, one more layer up, now inside C#'s own type
system instead of SQL's: also recognized in an architectural blueprint
versus the many houses actually built from it, each with its own address
and its own residents; a cookie cutter versus the many individual cookies
it shapes, each one eaten or crumbled independently of the others; and a
manufactured part's own engineering drawing versus every individual part
stamped from it, sharing tolerances and geometry but never sharing a serial
number.

### SE Lens

Why does C# require a formal `class` declaration — a fixed, named list of
properties, checked by the compiler — instead of letting code attach
whatever named values it wants to any object on the fly, the way a Python
dictionary or a JavaScript object literal can? The alternative not chosen —
free-form, dynamically-shaped objects — would mean no upfront declaration at
all: just start assigning `tool.name = "..."`, `tool.manufacturer = "..."`,
anywhere, anytime. But it also means a typo — `tool.Manufaturer` instead of
`tool.Manufacturer` — silently creates a *new*, wrong, empty field in a
dynamic language, rather than failing to compile at all. C#'s fixed class
shape, checked once by the compiler before the program ever runs, trades
that flexibility for a guarantee: every `Widget` this program ever builds
really does have both a `Name` and a `Count`, and any code trying to read a
property that was never declared fails immediately, at build time, the same
category of protection Lesson 1's own `CS0029` already proved for simple
variables — now extended to an entire object's whole shape at once.

### Connecting Back

`first` and `second` proved that a class really is one shape shared by many
independent objects — exactly the container this project's own tool data
needs, and doesn't yet have. What's still missing before that shape can be
built *from a database row* automatically, rather than by hand-typing
`Name = "Bolt"` the way this lab did, is a reusable piece of code that knows
how to do that translation once, correctly, in one place. That's the next
unit.

---

## Concept Unit: A Static Method as a Factory

### The Problem

The previous unit built `Widget` objects by hand, typing each property's
value directly into an object initializer. Reading a `Tool` out of a
database row can't work that way at every call site — the whole point of
the first unit's reader loop is that a caller doesn't know in advance how
many rows there are, so it can't hand-write a separate `new Tool { ... }`
literal for each one. Something needs to take a `SqliteDataReader`,
*already positioned on a row* by the first unit's `Read()`, and hand back
one real `Tool` object — reusably, from one place, no matter how many rows
end up calling it.

### The New Code

Back in `LabScratch`, reusing `Widget` one more time, this time asking a
different question: can `Widget` build *itself*, without a caller supplying
every value by hand?

```csharp
var fromFactory = Widget.CreateDefault();
Console.WriteLine($"fromFactory: Name={fromFactory.Name}, Count={fromFactory.Count}");

var second = Widget.CreateDefault();
second.Count = 5;
Console.WriteLine($"fromFactory.Count is still: {fromFactory.Count}, second.Count is now: {second.Count}");

class Widget
{
    public string Name { get; set; } = "";
    public int Count { get; set; }

    public static Widget CreateDefault()
    {
        return new Widget { Name = "Unnamed", Count = 0 };
    }
}
```

Real output, captured this session:

```
fromFactory: Name=Unnamed, Count=0
fromFactory.Count is still: 0, second.Count is now: 5
```

`Widget.CreateDefault()` is called on the *class name itself* — `Widget.`,
not `fromFactory.` or any other object's own name — because no `Widget`
object exists yet at the point it's called; this is called a **static
method**. Each call still returns a genuinely independent object, proven the
same way the previous unit proved it: changing `second.Count` afterward
leaves `fromFactory.Count` exactly as `CreateDefault()` originally set it.

### Discard the Throwaway Example

`Widget.CreateDefault()` and every line of this lab are discarded; none of
it becomes part of `ToolDB`. The real project's own static method, in the
next unit, builds a `Tool` from a database row instead of a `Widget` from
nothing.

### Project Change

No changes to `ToolDB` from this unit. This unit only proves a class can
build its own objects through a `static` method in isolation — the next
unit gives that method a real, non-trivial job: reading a `SqliteDataReader`
instead of returning fixed values.

### Mechanical Walkthrough

- `public static Widget CreateDefault() { ... }` — a **method** declaration,
  from the Header above: `public`, the same access modifier as `Widget`'s
  own properties; `static`, from the Header above, meaning this method
  belongs to `Widget` the class, not to any one `Widget` object; `Widget`
  right before the name is the method's declared **return type** — every
  call to `CreateDefault()` must hand back a real `Widget` or the code fails
  to compile; `CreateDefault` is the method's chosen name; `()` — empty —
  declares that this method takes no parameters at all.
- `return new Widget { Name = "Unnamed", Count = 0 };` — the `return`
  keyword, reappearing conceptually from Python's own `return` (already
  known), hands the freshly built object back to whoever called the method;
  `new Widget { Name = "Unnamed", Count = 0 }` is the identical object
  initializer syntax from the previous unit, just now written *inside* a
  method instead of directly in top-level statements.
- `var fromFactory = Widget.CreateDefault();` — `Widget.CreateDefault()`
  calls the static method by its class name, not through any variable —
  there is no `Widget` variable in scope yet at this point, and none is
  needed, because the method belongs to the class itself; `var` again infers
  `fromFactory`'s type from the method's own declared `Widget` return type.
- `Console.WriteLine($"fromFactory: Name={fromFactory.Name}, Count={fromFactory.Count}");`
  — reappearing property access and interpolation, reading the values the
  factory method assigned.
- `var second = Widget.CreateDefault();` — the identical static call a
  second time, building a genuinely separate object — proven, not assumed,
  by the next two lines.
- `second.Count = 5;` — reappearing property assignment, changing only
  `second`'s own `Count`.
- `Console.WriteLine($"fromFactory.Count is still: {fromFactory.Count}, second.Count is now: {second.Count}");`
  — the line that proves the two objects `CreateDefault()` built are
  independent: `fromFactory.Count` is unaffected by the change made to
  `second.Count`, exactly as the previous unit already proved for
  hand-built objects — now proven for factory-built ones too.

This isn't this curriculum's first time calling a `static` method — `File.
Exists(...)` and `File.Delete(...)`, used since Lesson 1, are both `static`
methods on `File`, called the same `ClassName.MethodName(...)` way, with no
`File` object ever created first. What's new here isn't *calling* a static
method; it's *declaring* one, on a class this project itself writes.

### CS Lens

A class that knows how to construct its own instances, exposed through one
named `static` method instead of leaving construction fully open at every
call site, is a real, named idea: the **factory method** pattern, from the
Header above. Also recognized in: `DateTime.Now`, a static member that
hands back a fully-built `DateTime` without any caller assembling year,
month, day, hour, minute, and second by hand; JSON libraries' own
`Deserialize<T>(...)`-style static entry points, which build a fully
populated object from raw external data in one call, the same shape this
lesson's next unit builds toward; and, in Python, a `@classmethod`-decorated
constructor alternative (`Widget.create_default()`), the identical idea
under a different language's own syntax.

### SE Lens

Why build a `static` factory method instead of a constructor —
`public Widget(string name, int count)` — taking the same values as ordinary
positional arguments? The alternative not chosen — a positional constructor
— is genuinely less code for a simple case like `Widget`. But Lesson 3's own
SE Lens already named the real risk positional arguments carry: nothing
stops two arguments from silently swapping order while the code still
compiles, quietly building a wrong object instead of failing loudly. A
factory method built specifically to read a `SqliteDataReader` — this
lesson's next unit's own job — keeps "how do I turn a row into a `Tool`"
written out, by name, in exactly one place, rather than repeated at every
call site that ever needs to build one from a reader. The honest cost: a
`static` factory method is one extra layer of indirection over a plain
constructor for what is, right now, a single caller — a cost this lesson's
own fifth unit turns into a direct benefit, by giving that one place
something an inline constructor call never could: somewhere to point an
automated test at.

### Connecting Back

`Widget.CreateDefault()` proved a class can hand back fully-built objects of
its own accord, through one named, reusable method — called by class name,
before any instance exists. The real project needs the exact same shape,
aimed at a real job: given a `SqliteDataReader` already positioned on a real
row, build one real `Tool`. The next unit writes that, for real, combining
every piece the last three units proved in isolation.

---

## Concept Unit: Row→Object Mapping, For Real

### The Problem

Three separate things have now been proven safe, in isolation: walking a
result set row by row (Concept Unit 1), declaring a class that holds several
related values as one object (Concept Unit 2), and a `static` method that
builds an object without a caller assembling it by hand (Concept Unit 3).
`tools.db` still holds exactly the same one row Lesson 3 left it with, and
`Program.cs` still only knows how to *insert*. Nothing has combined these
three proven pieces into the one thing this whole lesson exists to build:
a real `Tool`, built from `tools`'s own real row.

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule, no external application was
  searched for or read while writing this lesson.
- **Files affected** — `Tool.cs`, created (new file); `Program.cs`,
  modified.
- **Change type** — add (`Tool.cs`, in full) and replace (`Program.cs`'s
  Lesson 3 `INSERT` checkpoint).
- **Location** — `Tool.cs` is a brand-new file in `ToolDB/`, alongside
  `Program.cs` — a C# project compiles every `.cs` file inside it together,
  the same way Lesson 0's `.csproj` already governs every source file this
  project has, so a second file needs no explicit "include" step anywhere.
  In `Program.cs`, replacing everything from `string toolName = ...` through
  the closing `Console.WriteLine($"Row 1's stored manufacturer: ...");` line
  — Lesson 3's entire real `INSERT` checkpoint, all of it.
- **Dependencies** — the open `connection` variable from Lesson 1, and
  `tools.db`'s already-existing six-column schema and one real row from
  Lessons 2–3.

Lesson 3's own `INSERT` block is removed here for the identical reason
Lesson 3 itself removed Lesson 2's `CREATE TABLE` block: the row it inserts
already exists, permanently, on disk. Running that `INSERT` again on every
future `dotnet run` would silently add a second, third, fourth duplicate row
every time this program runs — `Program.cs`'s job, from this lesson forward,
is reading `tools` back, not re-writing what Lesson 3 already wrote once.

### The New Code

`Tool.cs`, in full — a brand-new file, so there's no existing structure to
place this inside of:

```csharp
using Microsoft.Data.Sqlite;

public class Tool
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Manufacturer { get; set; } = "";
    public double OverallDiameter { get; set; }
    public double OverallLength { get; set; }
    public int FluteCount { get; set; }

    public static Tool FromReader(SqliteDataReader reader)
    {
        return new Tool
        {
            Id = reader.GetInt32(0),
            Name = reader.GetString(1),
            Manufacturer = reader.GetString(2),
            OverallDiameter = reader.GetDouble(3),
            OverallLength = reader.GetDouble(4),
            FluteCount = reader.GetInt32(5)
        };
    }
}
```

`Program.cs`'s own new piece, using it:

```csharp
using var selectCommand = new SqliteCommand(
    "SELECT id, name, manufacturer, overall_diameter, overall_length, flute_count FROM tools",
    connection);
using var reader = selectCommand.ExecuteReader();

while (reader.Read())
{
    Tool tool = Tool.FromReader(reader);
    Console.WriteLine($"Tool #{tool.Id}: {tool.Name} ({tool.Manufacturer}), {tool.OverallDiameter}in dia x {tool.OverallLength}in, {tool.FluteCount} flutes");
}
```

### The Updated Project

Full `Program.cs`, new lines marked — `Tool.cs` needs no separate "updated
project" view of its own, since its New Code above already *is* the whole
new file, with nothing surrounding it yet:

```csharp
using Microsoft.Data.Sqlite;

string connectionString = "Data Source=tools.db";

using var connection = new SqliteConnection(connectionString);
connection.Open();

Console.WriteLine($"Connected. State: {connection.State}");
Console.WriteLine($"Database file on disk: {File.Exists("tools.db")}");

using var selectCommand = new SqliteCommand(                                                                          // ← new
    "SELECT id, name, manufacturer, overall_diameter, overall_length, flute_count FROM tools",                        // ← new
    connection);                                                                                                       // ← new
using var reader = selectCommand.ExecuteReader();                                                                      // ← new

while (reader.Read())                                                                                                  // ← new
{                                                                                                                       // ← new
    Tool tool = Tool.FromReader(reader);                                                                               // ← new
    Console.WriteLine($"Tool #{tool.Id}: {tool.Name} ({tool.Manufacturer}), {tool.OverallDiameter}in dia x {tool.OverallLength}in, {tool.FluteCount} flutes"); // ← new
}                                                                                                                       // ← new
```

The file no longer inserts anything at all — `tools.db`'s one row already
exists permanently, exactly as Lesson 3 left it. Instead, `Program.cs` now
does something this project has never done before: reads its own stored
data back out, maps every row it finds into a real `Tool` object, and prints
what it actually holds.

### Mechanical Walkthrough

- `using Microsoft.Data.Sqlite;` at the top of `Tool.cs` — reappearing from
  every prior lesson's `Program.cs`, needed here for the exact same reason:
  `Tool.cs` refers to `SqliteDataReader` by name, so this file needs its own
  `using` directive; a `using` in one file never applies to any other file
  in the same project.
- `public class Tool` — the **class** declaration from Concept Unit 2,
  applied for real; `public`, the **access modifier** from the Header above,
  chosen specifically (not `internal`, C#'s unmarked default) because this
  lesson's fifth unit needs `Tool` visible from a second, separate project —
  `internal`'s assembly-only visibility would block that entirely, a real
  constraint this lesson is designing around now, before it becomes a build
  error later.
- `public int Id { get; set; }` through `public int FluteCount { get; set;
  }` — five more **properties**, from the Header above, the same
  auto-implemented shape Concept Unit 2 already proved; the two `string`
  properties (`Name`, `Manufacturer`) default to `""`, matching
  `tools`'s own `NOT NULL TEXT` columns (Lesson 2); the two `double`
  properties (`OverallDiameter`, `OverallLength`) and the `int` property
  (`FluteCount`) need no explicit default — `0` and `0.0` are C#'s own
  built-in defaults for numeric types, reused here the same way Concept Unit
  2's own `Count` property already relied on them.
- `public static Tool FromReader(SqliteDataReader reader)` — the **factory
  method** pattern from Concept Unit 3, applied for real: `public static`,
  identical to `Widget.CreateDefault()`; `Tool`, the declared return type;
  `FromReader`, a name chosen to say exactly what this method does; and,
  new relative to Concept Unit 3's own parameterless `CreateDefault()`, one
  declared **parameter**, `SqliteDataReader reader` — a typed name this
  method can refer to internally, standing in for whatever real
  `SqliteDataReader` a caller passes in, already positioned on the row to
  map.
- `return new Tool { Id = reader.GetInt32(0), ... };` — the same `return` +
  object-initializer shape from Concept Unit 3, this time reading six real
  values off the `reader` parameter instead of writing fixed literals: each
  property is assigned the result of one `Get*(ordinal)` call from Concept
  Unit 1, in the exact order the real `SELECT`'s own column list named them
  — `id` at `0`, `name` at `1`, `manufacturer` at `2`, `overall_diameter` at
  `3`, `overall_length` at `4`, `flute_count` at `5`.
- `using var selectCommand = new SqliteCommand("SELECT id, name,
  manufacturer, overall_diameter, overall_length, flute_count FROM tools",
  connection);` — the same constructor reused again, carrying a `SELECT`
  naming all six columns `tools` actually has, in the same order `Tool.
  FromReader`'s own ordinals above expect them.
- `using var reader = selectCommand.ExecuteReader();` — `ExecuteReader()`
  from the Header above, called against the real `tools` table this time
  instead of Concept Unit 1's scratch `items`.
- `while (reader.Read())` — the identical cursor-driven loop from Concept
  Unit 1, now the real project's own.
- `Tool tool = Tool.FromReader(reader);` — the point this whole unit exists
  for: `Tool.FromReader(reader)` calls the static factory method from above,
  handing it the reader — already advanced to the current row by this same
  loop's own `Read()` call — and receives back one real, fully-populated
  `Tool` object; `Tool tool` declares a local variable to hold it, this
  time with an explicit type instead of `var`, matching the explicit style
  Lesson 1 already used for `connectionString`.
- `Console.WriteLine($"Tool #{tool.Id}: {tool.Name} ({tool.Manufacturer}),
  {tool.OverallDiameter}in dia x {tool.OverallLength}in, {tool.FluteCount}
  flutes");` — reappearing property access (Concept Unit 2) on all six of
  `tool`'s properties at once, and reappearing interpolation, printing one
  full, human-readable line per tool the loop visits.

### CS Lens

Translating a row from a relational store into a structured in-memory object
is a real, named idea, not something this lesson invented: the **Data
Mapper** pattern (Martin Fowler's *Patterns of Enterprise Application
Architecture*) — a piece of code whose only job is moving data between an
object and a database, keeping the object itself ignorant of where its data
came from. Also recognized in: JSON deserialization
(`JsonSerializer.Deserialize<T>(...)`, turning external JSON text into a
structured object the same way `Tool.FromReader` turns a database row into
one); CSV-parsing libraries turning each spreadsheet row into an object;
and, directly ahead in this curriculum, Lesson 24's Entity Framework Core —
an entire library whose core job is doing, automatically and at scale, the
exact translation `Tool.FromReader` does by hand for one table right now.

### SE Lens

Why does `FromReader` return a whole `Tool` object instead of `Program.cs`
just calling `reader.GetString(1)`/`reader.GetString(2)`/etc. directly
inline, the way Concept Unit 1's own lab did? The alternative not chosen —
raw reader calls scattered wherever a tool's data is needed — costs nothing
extra right now, for a program that only ever prints what it reads. But
every future lesson this curriculum has already planned — Lesson 9's
multi-table `JOIN`s, Lesson 17's WPF form binding, Lesson 18's WebView2
bridge — needs to pass "one tool" around as a single, coherent value, not
five loose variables that only mean something if they're kept together by
convention. Lesson 8's own future title calls the object this unit just
built "the raw mapped object from Lesson 4" for a reason: it's a genuine,
useful improvement over five loose values, and still not the final shape
this project's domain model will take — record types, value semantics, and
exactly what's still "raw" about it are Lesson 8's own subject, not this
one's.

### Commands Needed

- `dotnet build` — reappearing from Lessons 0–3: compiles without running,
  reporting warnings and errors; used here to confirm this checkpoint builds
  cleanly with the new `Tool.cs` file included.
- `dotnet run` — reappearing from Lessons 0–3: builds (restoring first if
  needed) and executes, streaming output back.

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
Tool #1: 1/2 in 4-Flute Carbide End Mill (O'Brien Carbide Tools), 0.5in dia x 3in, 4 flutes
```

### Connecting Back

`tools.db`'s one real row — the same endmill, from the same
apostrophe-carrying manufacturer, Lesson 3 safely inserted — has now made a
full round trip: written safely, read back through a real cursor, and
mapped into this project's first genuine domain object, by this project's
first genuine user-written method. Nothing about that last sentence can be
verified by anyone except a human reading the three lines `dotnet run` just
printed. The next unit removes that dependency on a human entirely.

---

## Concept Unit: Automated Tests — xUnit, `[Fact]`, and `Assert`

### The Problem

`Tool.FromReader`'s correctness right now rests entirely on one fact: this
lesson's own author read the three lines `dotnet run` printed and judged
them correct by eye. That's exactly what every prior lesson in this
curriculum has already done, every single time — and it has a real, growing
cost this lesson can now name precisely, because `Tool.FromReader` is the
first piece of code in this project actually complex enough to get subtly
wrong: six ordinals, each one a plain `int` with no connection back to the
column name it's supposed to represent. Swap two of them, and `dotnet run`
still runs, still prints a plausible-looking line, and nothing about the
output visibly screams "this is wrong" — this lesson's own Closing proves
that claim for real, not just asserts it. What's needed is a way to check
`Tool.FromReader`'s correctness that doesn't depend on a human's eyes
catching a subtly wrong value in a wall of text.

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule, no external application was
  searched for or read while writing this lesson.
- **Files affected** — a new project, `ToolDB.Tests/` (created via
  `dotnet new xunit`), containing `ToolDB.Tests.csproj` and `ToolTests.cs`.
  `ToolDB/Program.cs` and `Tool.cs` are unchanged by this unit.
- **Change type** — add (an entire new project).
- **Location** — `ToolDB.Tests/` sits alongside `ToolDB/` and `LabScratch/`,
  inside this project's own `code/` folder — a sibling project, not a
  subfolder of `ToolDB` itself, matching how `LabScratch` already sits
  beside `ToolDB` rather than inside it.
- **Dependencies** — a project reference from `ToolDB.Tests` to `ToolDB`
  (so `ToolTests.cs` can see the real, `public` `Tool` class from the
  previous unit), and the `Microsoft.Data.Sqlite` package added directly to
  `ToolDB.Tests` too, since the test builds its own throwaway database
  rather than depending on `tools.db`.

### The New Code

`dotnet new xunit` (Commands Needed, below) generates a starter project;
this lesson's own real test file, `ToolTests.cs`, replaces its
placeholder example entirely:

```csharp
using Microsoft.Data.Sqlite;

public class ToolTests
{
    [Fact]
    public void FromReader_MapsAllColumnsOntoTool()
    {
        string testDbPath = "test_tool_mapping.db";
        if (File.Exists(testDbPath))
        {
            File.Delete(testDbPath);
        }

        using var connection = new SqliteConnection($"Data Source={testDbPath}");
        connection.Open();

        using var createCommand = new SqliteCommand(
            "CREATE TABLE tools (id INTEGER PRIMARY KEY, name TEXT NOT NULL, manufacturer TEXT NOT NULL, overall_diameter REAL NOT NULL, overall_length REAL NOT NULL, flute_count INTEGER NOT NULL)",
            connection);
        createCommand.ExecuteNonQuery();

        using var insertCommand = new SqliteCommand(
            "INSERT INTO tools (name, manufacturer, overall_diameter, overall_length, flute_count) VALUES (@name, @manufacturer, @overall_diameter, @overall_length, @flute_count)",
            connection);
        insertCommand.Parameters.Add(new SqliteParameter("@name", "3/8 in 2-Flute Carbide End Mill"));
        insertCommand.Parameters.Add(new SqliteParameter("@manufacturer", "Test Tooling Co."));
        insertCommand.Parameters.Add(new SqliteParameter("@overall_diameter", 0.375));
        insertCommand.Parameters.Add(new SqliteParameter("@overall_length", 2.5));
        insertCommand.Parameters.Add(new SqliteParameter("@flute_count", 2));
        insertCommand.ExecuteNonQuery();

        using var selectCommand = new SqliteCommand(
            "SELECT id, name, manufacturer, overall_diameter, overall_length, flute_count FROM tools",
            connection);
        using var reader = selectCommand.ExecuteReader();
        reader.Read();

        Tool tool = Tool.FromReader(reader);

        Assert.Equal(1, tool.Id);
        Assert.Equal("3/8 in 2-Flute Carbide End Mill", tool.Name);
        Assert.Equal("Test Tooling Co.", tool.Manufacturer);
        Assert.Equal(0.375, tool.OverallDiameter);
        Assert.Equal(2.5, tool.OverallLength);
        Assert.Equal(2, tool.FluteCount);
    }
}
```

Deliberately, this test never touches `tools.db` — it builds its own tiny,
throwaway `tools`-shaped table, seeds it with one known row using values
chosen specifically to differ from the real `tools.db` row (a different
name, a different manufacturer, different dimensions), and checks the
mapping against those known values instead. It doesn't clean its own
database file up afterward, either — that omission is this unit's own next
piece of real, discovered behavior, not an oversight, explained fully below.

### The Updated Project

`ToolDB.Tests/` has no prior state to update against — it's a brand-new
project, and `ToolTests.cs` above already shows its one complete file in
full, with nothing surrounding it yet.

### Mechanical Walkthrough

- `[Fact]` — an **attribute**, from the Header above, written directly
  above the method it applies to. xUnit's own documentation, fetched this
  session, states plainly: "Facts are tests which are always true. They
  test invariant conditions." Nothing in C#'s own language rules gives
  `[Fact]` any special meaning by itself — it's xUnit's test-discovery
  tooling, run by `dotnet test`, that specifically looks for methods marked
  this way inside a compiled test project and runs each one it finds.
- `public void FromReader_MapsAllColumnsOntoTool()` — a **method**
  declaration, from the Header above, same shape as `Tool.FromReader`
  itself: `public`, a declared return type (`void` — this method returns
  nothing; its result is pass or fail, reported through **assertions**
  below, not through a returned value), a name (chosen to describe exactly
  what's being verified, a real xUnit naming convention), and an empty
  parameter list.
- `string testDbPath = "test_tool_mapping.db"; if (File.Exists(testDbPath))
  { File.Delete(testDbPath); }` — the same "delete any stale file before
  running, not after" pattern every throwaway lab in this curriculum has
  already used, reused here for a genuinely new reason, explained next.
- `using var connection = ...` through `insertCommand.ExecuteNonQuery();`
  — every piece here reappears unchanged from Lessons 1–3:
  `SqliteConnection`, `SqliteCommand`, parameterized `INSERT` via
  `SqliteParameter`/`Parameters.Add`. This test's own **arrange** step —
  building a small, fully controlled starting state — reuses this
  project's own already-proven-safe insert technique rather than any
  shortcut, because a test's own setup data deserves the same correctness
  standard as the real application's data.
- `using var selectCommand = ...` through `reader.Read();` — the identical
  `SELECT` + `ExecuteReader()` + single `Read()` call from this lesson's
  first unit, advancing the cursor to the one row this test just inserted.
- `Tool tool = Tool.FromReader(reader);` — the exact same call
  `Program.cs` makes in its own loop, now called from a completely
  different project, proving `public`, from Concept Unit 4, really did make
  `Tool` visible across the project boundary it was declared for.
- `Assert.Equal(1, tool.Id);` through `Assert.Equal(2, tool.FluteCount);` —
  six **assertions**, from the Header above, one per property: each call
  states an expected value first, the actual value second, and the test
  method stops immediately, marked failed, the instant any one of them
  doesn't match — proven directly by this unit's own real, captured run
  below.

**A real failure and its fix, discovered while writing this checkpoint.**
The version above ends after the sixth assertion — no cleanup. An earlier
version added `connection.Close(); File.Delete(testDbPath);` at the end, to
tidy up the test database file after each run. Run for real, that version
failed immediately:

```
System.IO.IOException : The process cannot access the file
'...\ToolDB.Tests\bin\Debug\net10.0\test_tool_mapping.db'
because it is being used by another process.
```

This is **connection pooling**, from the Header above, reappearing from
Lesson 1 in a genuinely new context: `Microsoft.Data.Sqlite` keeps a closed
connection's underlying native SQLite handle held open behind the scenes,
ready for reuse, even after `Close()` returns — Lesson 1 already proved this
causes a file lock to outlive `Close()`, and this test hit exactly that same
stale handle, this time trying to *delete* the file rather than reopen it.
The fix is the one shown above: don't try to delete the file at the *end* of
a run while the pool might still be holding it open — rely on the *next*
run's own leading `File.Exists`/`File.Delete` guard instead, the same
pattern every throwaway lab already uses, for the same underlying reason.

### CS Lens

Checking a piece of code's behavior against a known-correct expected result,
automatically and repeatably, rather than trusting a one-time manual
inspection, is a recurring idea for verifying anything that has to keep
being true over time — not unique to software. Also recognized in:
scientific reproducibility — a documented experimental procedure anyone can
rerun to get the same result, rather than trusting one researcher's own
account of what happened; a manufacturing go/no-go gauge, checked against
*every* part coming off a line, not just the first one inspected by eye —
directly relevant to this project's own domain; and **regression testing**
generally, the practice of specifically re-checking old, already-fixed
behavior stays fixed, so a change made for an unrelated reason can't quietly
reintroduce a bug that was already caught and corrected once.

### SE Lens

Why a whole separate project, with its own package references and its own
build step, instead of just adding `if` checks and `Console.WriteLine("FAIL
if this happens")` lines directly inside `Program.cs` itself? The
alternative not chosen — ad hoc checks printed alongside the program's
ordinary output — costs nothing extra to set up. But it still requires a
human to run the program, read its entire output, and notice one wrong-
looking line among everything else printed — precisely the same weak
verification this whole unit exists to remove, just moved one line lower in
the same file. A separate test project produces one unambiguous signal —
`dotnet test` exits successfully or it doesn't — that any tool can check
without a human reading a transcript at all: a script, an editor, or, once
this curriculum reaches it, a CI pipeline. The honest cost accepted right
now: this test's own `CREATE TABLE` statement is a second, hand-typed copy
of `tools`'s real schema, and nothing currently keeps the two in sync if one
changes without the other — a real gap this project is knowingly carrying
until Lesson 26's schema migrations give both a single, shared source of
truth to build from instead.

### Commands Needed

- `dotnet new xunit -o ToolDB.Tests` — reappearing `dotnet new` from Lesson
  0, this time with the `xunit` template instead of `console`, and `-o
  ToolDB.Tests` naming the output folder directly; generates a working test
  project with `Microsoft.NET.Test.Sdk`, `xunit`, and `xunit.runner.
  visualstudio` already referenced.
- `dotnet add ToolDB.Tests/ToolDB.Tests.csproj reference ToolDB/ToolDB.csproj`
  — a new form of `dotnet add`: instead of adding a NuGet package (Lesson
  0), `reference` adds a **project reference** — one project's compiled
  output becoming visible to another, which is what makes `Tool` (as long
  as it's `public`) callable from `ToolDB.Tests` at all.
  `dotnet add ToolDB.Tests/ToolDB.Tests.csproj package Microsoft.Data.Sqlite`
  — the ordinary package-adding form from Lesson 0, run a second time
  against the test project specifically.
- `dotnet test` — a new command: builds every referenced project, discovers
  every `[Fact]`-marked method across the whole test project, runs each one,
  and reports pass/fail for the whole run.

### Run It — Real Output

```
dotnet test
```

Real output, captured this session, from inside `ToolDB.Tests/`:

```
Passed!  - Failed:     0, Passed:     1, Skipped:     0, Total:     1, Duration: 48 ms - ToolDB.Tests.dll (net10.0)
```

### Connecting Back

`Tool.FromReader`'s correctness no longer depends on anyone reading
`dotnet run`'s own console output and judging it correct by eye — `dotnet
test` now checks all six of its mapped properties, automatically, every
single time it's asked, against values chosen specifically to be different
from `tools.db`'s own real row, so this test can never accidentally pass
just because it happens to match what the real database already contains.
What hasn't been shown yet is whether this test actually *catches* anything
— whether it would fail for real if `Tool.FromReader` really were broken.
That's exactly what this lesson's Closing does next.

---

## Closing

### Connect the Pieces

One trace, start to finish, using only what actually ran on this machine
this session. The first unit's own lab proved a `SqliteDataReader`'s
`Read()` loop really does walk a multi-row result one row at a time,
stopping the instant `Read()` reports `false` — three real rows, visited in
order, confirmed by a real, printed trace. The second unit proved a `class`
really does let independent objects share one shape without sharing their
own values — and along the way, a real `CS8803` compiler error proved
*why* a class declared inside a top-level-statements file has to come after
the statements using it. The third unit proved a `static` method can build
and hand back a fully-formed object of its own class, called by class name
before any instance exists. The fourth unit combined all three for real:
`Tool.cs`, a genuine new file holding this project's first user-defined
type, and `Program.cs`'s own updated checkpoint, which read `tools.db`'s
one real row back through exactly the cursor the first unit proved safe,
and mapped it through exactly the factory method the third unit proved
safe — producing, and printing,
`Tool #1: 1/2 in 4-Flute Carbide End Mill (O'Brien Carbide Tools), 0.5in dia
x 3in, 4 flutes`, a real value this project has never produced before this
lesson. The fifth unit then built a second, independent project whose only
job is checking that exact mapping stays correct — a real automated test,
passing for real, against values deliberately different from `tools.db`'s
own row. Change any one link — swap two ordinals inside `Tool.FromReader`
— and the next section proves, on this exact project, precisely what
breaks, and precisely what catches it.

### What Breaks Without This

Temporarily edit `Tool.cs`'s `FromReader` method, swapping which ordinal
`Name` and `Manufacturer` each read from — a realistic mistake, not a
contrived one; `name` and `manufacturer` are adjacent columns, both
`string`s, exactly the kind of two values a tired programmer could
transpose without noticing:

```csharp
Name = reader.GetString(2),
Manufacturer = reader.GetString(1),
```

First, run the real application — the same verification every prior lesson
in this curriculum has relied on:

```
dotnet run
```

Real output, captured this session, from inside `ToolDB/`, with the bug in
place:

```
Connected. State: Open
Database file on disk: True
Tool #1: O'Brien Carbide Tools (1/2 in 4-Flute Carbide End Mill), 0.5in dia x 3in, 4 flutes
```

Read that line without already knowing it's wrong. Nothing about it looks
broken — `"O'Brien Carbide Tools"` and `"1/2 in 4-Flute Carbide End Mill"`
are both real, plausible-looking strings; they're simply sitting in each
other's slots. This is precisely the failure mode this lesson's fifth unit
named before proving it: a bug a human skimming console output could
genuinely miss. Now run the automated test against the identical broken
code:

```
dotnet test
```

Real output, captured this session, from inside `ToolDB.Tests/`, same bug,
same build:

```
[xUnit.net 00:00:00.17]     ToolTests.FromReader_MapsAllColumnsOntoTool [FAIL]
  Failed ToolTests.FromReader_MapsAllColumnsOntoTool [72 ms]
  Error Message:
   Assert.Equal() Failure: Strings differ
           ↓ (pos 0)
Expected: "3/8 in 2-Flute Carbide End Mill"
Actual:   "Test Tooling Co."
           ↑ (pos 0)
  Stack Trace:
     at ToolTests.FromReader_MapsAllColumnsOntoTool() in ToolDB.Tests\ToolTests.cs:line 41

Failed!  - Failed:     0, Passed:     1, Skipped:     0, Total:     1, Duration: 81 ms - ToolDB.Tests.dll (net10.0)
```

No human judgment involved anywhere in this second result: `Assert.Equal`
compared exactly what `tool.Name` actually held against exactly what the
test's own known-correct row said it should hold, found them different, and
reported precisely which assertion failed, on which line, with both values
printed side by side — the same bug the console output above made look
completely ordinary, caught immediately and unambiguously. Restoring
`Tool.cs`'s two swapped lines and rebuilding confirms both signals flip back
together:

```
dotnet build
```

Real output, captured this session:

```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

```
dotnet test
```

Real output, captured this session, from inside `ToolDB.Tests/`:

```
Passed!  - Failed:     0, Passed:     1, Skipped:     0, Total:     1, Duration: 48 ms - ToolDB.Tests.dll (net10.0)
```

```
dotnet run
```

Real output, captured this session, from inside `ToolDB/`:

```
Connected. State: Open
Database file on disk: True
Tool #1: 1/2 in 4-Flute Carbide End Mill (O'Brien Carbide Tools), 0.5in dia x 3in, 4 flutes
```

All three signals agree again: a clean build, a passing test, and correct
console output. `tools.db` itself was never touched by any of this — the automated test
never opens it at all, and the "what breaks" experiment only ever edited
`Tool.cs`'s own mapping logic, restored immediately afterward.

### Exercises

- This lesson's own real checkpoint reads `tools`'s six columns by ordinal
  position (`0` through `5`), matching the `SELECT`'s own column order
  exactly. `SqliteDataReader.GetOrdinal(string name)` — listed alongside
  `Read()` and the `Get*` methods in Microsoft's own reference this lesson
  already cited — looks up a column's ordinal *by name* instead. Rewrite
  `Tool.FromReader` to call `reader.GetOrdinal("name")`,
  `reader.GetOrdinal("manufacturer")`, etc. once each, storing the results
  in local variables, then use those instead of the literal `0`–`5`. Rerun
  `dotnet test` to confirm it still passes, then consider — using this
  lesson's own SE Lens on positional risk — what real problem this rewrite
  removes, and what it costs (a hint: time it, for real, on a table with
  many columns).
- The `ToolTests.cs` in this lesson tests exactly one row. Add a second
  `[Fact]`-marked method to the same class, inserting a *different* known
  row (choose different values from the ones already used) and asserting
  its own mapped `Tool` matches. Run `dotnet test` and read its own summary
  line to confirm it now reports `Total: 2`.
- This lesson's Closing broke `Tool.FromReader` by swapping two column
  reads. Using this lesson's own `SqliteDataReader.GetInt32`/`GetDouble`/
  `GetString` Header entries, predict what happens if `FluteCount` — an
  `int` property — is deliberately mapped from `reader.GetDouble(5)`
  instead of `reader.GetInt32(5)`. Try it against the real checkpoint, read
  the actual error or behavior, and compare it against your prediction.

### Definition of Done

- [ ] `ToolDB/Tool.cs` exists, declares `public class Tool` with all six
      properties, and `ToolDB/Program.cs` builds with `dotnet build` at 0
      warnings, 0 errors.
- [ ] `dotnet run`, from `ToolDB/`, prints `Connected. State: Open`,
      `Database file on disk: True`, and exactly one `Tool #1: ...` line
      matching `tools.db`'s real, single row.
- [ ] `ToolDB.Tests/` exists as its own project, referencing `ToolDB` and
      `Microsoft.Data.Sqlite`, and `dotnet test` from inside it reports
      `Passed!` with `Failed: 0`.
- [ ] The "what breaks" experiment above was actually run against the real,
      finished checkpoint: the swapped-ordinal bug was introduced, `dotnet
      run`'s deceptively plausible-looking output was seen, `dotnet test`'s
      real, precise failure was seen, and `Tool.cs` was restored afterward —
      confirmed, again, by both `dotnet test` passing and `dotnet run`
      printing the correct line.
- [ ] `tools.db` itself still contains exactly one row, unchanged by
      anything in this lesson — confirmed via a real, read-only `COUNT(*)`
      check, not merely assumed.
- [ ] A git commit exists containing `Tool.cs`, the updated `Program.cs`,
      and the new `ToolDB.Tests/` project, with a message explaining *why*
      (this project can now read its own data back, mapped into a real
      object, and an automated test — not a human reading console output —
      is what proves that mapping stays correct going forward).

Next lesson: **Lesson 5 — WPF Basics**, opening this project's first native
window — the first lesson since Lesson 0 that isn't only about `tools.db`
at all.
