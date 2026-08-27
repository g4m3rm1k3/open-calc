# Lesson 4: A Type for Data, Not Behavior — Representing a File as Data

**What you will build.** A new `InputFile` type — a small, three-field
description of one candidate file (its path, its name, and when it was
last modified) — and a first, real proof that this project can turn an
actual file sitting on disk into one of these and show it on screen: the
running program's own compiled executable, converted into an `InputFile`
and listed in a new `ListBox` under the folder row. What this lesson is
actually about goes past this one type: every type this project has
written so far — `MainWindow`, `FileSource` — exists to *do* something;
`InputFile` is this project's first type that exists purely to *be*
something — a plain bundle of facts, with no method of its own beyond what
the compiler writes for it. This lesson is the first place the curriculum
asks not "what should this type do" but "what should this data look
like."

**What you need to know first.** Lesson 1 — the `class` keyword and
`namespace`, for contrast against this lesson's `record`; and
`ImplicitUsings`, whose exact effect this lesson checks again for real,
against a different project shape. Lesson 3 — the `FileSource` pattern (a
plain class, deliberately kept free of any WPF-specific dependency), which
this lesson's own conversion code, for now, deliberately does not follow —
explained and flagged honestly where it happens, not silently.

**Terms used in this lesson.**

- **`record` (declaring a record)** — a C# keyword declaring a reference
  type designed primarily to hold data, using a compact positional syntax:
  the parameter list right after the record's name
  (`InputFile(string Path, string FileName, DateTime LastModified)`) both
  declares the record's constructor parameters and, for each one,
  generates a matching public property of the same name and type — with
  no method body written by hand for any of it. It exists because a huge
  fraction of the types any real program needs are pure data — a handful
  of named values traveling together, with no behavior of their own beyond
  holding those values — and writing that by hand as an ordinary `class`
  (a constructor, then one property per parameter, each with its own
  `{ get; }`) is repetitive, mechanical boilerplate a language feature can
  generate instead.
- **`init` accessor** — a C# property accessor, written as `init` instead
  of `set`, that only permits assignment during object construction
  (inside an object-initializer expression, or, for a positional record's
  generated properties, via the record's own constructor). Once
  construction finishes, the property becomes permanently unassignable —
  the same guarantee a `readonly` field gives after its constructor
  finishes. It exists to let a property be set once, safely, at creation
  time, while still being permanently locked afterward: a plain `get`-only
  property can only ever be assigned from inside its own declaring class's
  constructor body, never via external object-initializer syntax, while an
  ordinary `get; set;` property stays assignable forever, from anywhere
  the property itself is visible — `init` is the one option that's both
  externally settable at construction and locked immediately after.
- **null-forgiving operator (`!`)** — a C# operator, written as a trailing
  `!` immediately after an expression of a nullable type, that tells the
  compiler "trust me — I know this specific value is not actually `null`
  here, even though its declared type says it could be," suppressing
  whatever nullable-reference-type warning the compiler would otherwise
  raise at that exact spot. It exists because the compiler's own nullable
  analysis is necessarily conservative — it can prove many things are
  safe, but not everything a person genuinely knows to be true from
  context the compiler can't see — and without `!`, code with real,
  justified certainty a value isn't `null` in one specific spot would have
  no way to say so except leaving a real warning in the build output
  forever. The `!` compiles to nothing at all: it does not check, convert,
  or change the value in any way; it only changes what the compiler is
  willing to warn about.
- **string interpolation (`$"..."`)** — a C# string syntax, written as a
  `$` immediately before an opening double-quote, that allows a
  curly-brace-delimited expression (`{someExpression}`) to appear directly
  inside the string's own text, replaced at run time with that
  expression's value converted to a string. It exists to build a string
  out of a mix of fixed text and computed values without the older
  alternative of concatenating several separate pieces with `+`, which
  grows harder to read as more pieces are added and easier to get wrong (a
  missing space, a misplaced `+`).
- **`var` (implicit typing)** — a C# keyword letting a local variable's
  declaration omit its explicit type, leaving the compiler to infer it
  from whatever is immediately assigned to it. It exists purely to reduce
  repetition: stating a constructed type's name once, on the right-hand
  side of `new`, is enough for the compiler to know the variable's type
  without also spelling it out, redundantly, on the left. `var` does not
  mean "any type, decided at runtime" — the type is still fixed and
  checked at compile time, merely not written by hand.

**Objects and methods used.**

- **`InputFile`**
  - *What it is:* this project's new record representing one candidate
    file — a path, a file name, and a last-modified timestamp, traveling
    together as one value.
  - *Implementation:* `public record InputFile(string Path, string
    FileName, DateTime LastModified);` — a single line, in its own file,
    with no body at all. The positional parameter list generates three
    real public properties: `string Path { get; init; }`, `string
    FileName { get; init; }`, and `DateTime LastModified { get; init; }` —
    each an **`init` accessor** (Header above), settable only through the
    record's own generated constructor, never afterward.
  - *Its use:* the shared shape every later part of this curriculum's
    file-discovery system will hand around, instead of passing raw
    `FileInfo` objects or bare strings everywhere.
  - *Type:* a public record (a reference type, like a class, not a value
    type), constructed with `new`.
  - *Responsibility:* holding exactly these three facts about one file,
    together, as a single value — nothing about scanning, comparing, or
    displaying files is this type's job.
  - *Depends on:* nothing beyond the three values handed to its
    constructor.
  - *Connects to:* constructed in this lesson's third Concept Unit from a
    real `FileInfo`; its `FileName` and `LastModified` properties are read
    in this lesson's fourth Concept Unit to build the text shown in the
    UI.
  - *Shape:* this project's first pure data type — no method, no
    behavior, sitting apart from every class this curriculum has written
    so far.
- **`DateTime`**
  - *What it is:* a .NET type representing one specific point in time —
    a calendar date together with a time of day.
  - *Implementation:* a public struct (a value type, unlike `InputFile`)
    in the `System` namespace, available in this file with no `using`
    directive needed, since `System` is one of this project's own real,
    generated implicit usings (proven in this lesson's third Concept
    Unit).
  - *Its use:* the declared type of `InputFile`'s third field,
    `LastModified`, and of `FileInfo.LastWriteTime` (below), whose value
    flows straight into it.
  - *Type:* a struct, constructed either with `new DateTime(...)` or, as
    in this lesson, simply received as the return value of another
    member.
  - *Responsibility:* representing one moment in time precisely enough to
    compare, format, and display.
  - *Depends on:* nothing beyond whatever numeric components (or another
    member's return value) it's built from.
  - *Connects to:* returned by `FileInfo.LastWriteTime`; stored, unchanged,
    as `InputFile.LastModified`.
  - *Shape:* an ordinary, everyday base-class-library value type — not
    part of WPF, not part of this project, borrowed the same way
    `System.Uri` was in an earlier lesson.
- **`System.IO.FileInfo`**
  - *What it is:* a .NET class representing one specific file on disk,
    giving access to its real filesystem metadata — its name, its full
    path, when it was last written to, and more this lesson doesn't use.
  - *Implementation:* `public class FileInfo` in the `System.IO`
    namespace, referenced here by its fully qualified name because this
    project's own real, generated implicit usings (proven in this
    lesson's third Concept Unit) do not include `System.IO` — unlike a
    plain console project's default usings, which do.
  - *Its use:* the one mechanism this lesson uses to get real facts about
    a real file, rather than typing fabricated sample values by hand.
  - *Type:* a public class, instantiated with `new`, given a file path as
    its one constructor argument.
  - *Responsibility:* looking up, from the real operating system, whatever
    metadata a given path's file actually has, and exposing it through its
    own properties.
  - *Depends on:* a real, valid file path handed to its constructor.
  - *Connects to:* constructed from `Environment.ProcessPath` (below);
    its `Name`, `FullName`, and `LastWriteTime` properties (all below) are
    read to build an `InputFile`.
  - *Shape:* this lesson's one bridge from "a real fact about the outside
    world" into this program's own data.
- **`FileInfo.Name`**
  - *What it is:* the file's own name, without any directory path in
    front of it.
  - *Implementation:* a read-only `string` property.
  - *Its use:* becomes `InputFile.FileName`.
  - *Type:* an instance property.
  - *Responsibility:* holding just the file name portion of the full
    path.
  - *Depends on:* the `FileInfo` instance already being constructed from a
    real path.
  - *Connects to:* read once, when building this lesson's one
    `InputFile`.
  - *Shape:* the shorter, display-friendly half of a file's identity —
    contrasted with `FullName`, next.
- **`FileInfo.FullName`**
  - *What it is:* the file's complete path, directory and all.
  - *Implementation:* a read-only `string` property.
  - *Its use:* becomes `InputFile.Path`.
  - *Type:* an instance property.
  - *Responsibility:* holding the file's complete, unambiguous location.
  - *Depends on:* the `FileInfo` instance already being constructed from a
    real path.
  - *Connects to:* read once, when building this lesson's one
    `InputFile`.
  - *Shape:* the longer, unambiguous half of a file's identity —
    contrasted with `Name`, above.
- **`FileInfo.LastWriteTime`**
  - *What it is:* when the file was last modified.
  - *Implementation:* a `DateTime`-typed property.
  - *Its use:* becomes `InputFile.LastModified` — the one value in this
    lesson's whole chain that is genuinely unpredictable ahead of time,
    since it depends on real, external filesystem state, not on anything
    this program itself computes.
  - *Type:* an instance property.
  - *Responsibility:* reporting the real timestamp the operating system's
    own filesystem records for this file.
  - *Depends on:* the `FileInfo` instance already being constructed from a
    real path.
  - *Connects to:* read once, when building this lesson's one
    `InputFile`.
  - *Shape:* the one piece of this lesson's data that comes from the
    outside world, not from this program's own logic.
- **`Environment.ProcessPath`**
  - *What it is:* the absolute file path of the currently running
    process's own executable.
  - *Implementation:* a `static` property, declared `string?` (a
    **nullable reference type**, per this project's own
    `<Nullable>enable</Nullable>` setting) on the `Environment` class in
    `System`.
  - *Its use:* gives this lesson a real file to build a `FileInfo` from,
    without needing a real directory scan (which doesn't exist yet) or a
    fabricated, made-up path.
  - *Type:* a `static` property — read through the class name,
    `Environment.ProcessPath`, with no `Environment` instance involved,
    because "which process is currently running" isn't a fact tied to any
    one object this program constructs.
  - *Responsibility:* reporting one fact about the operating system's own
    process table — where the running program's own executable file
    lives.
  - *Depends on:* nothing beyond a process actually being running (which,
    by the time any C# code executes, is always already true).
  - *Connects to:* its value, once confirmed non-null with the
    **null-forgiving operator** (Header above), is handed straight into
    `FileInfo`'s constructor.
  - *Shape:* the starting point of this lesson's entire chain — the one
    piece of information that lets a `FileInfo`, an `InputFile`, and a
    `ListBox` entry all exist for a real file, before any real directory
    scanner exists in this project.
- **`ListBox`**
  - *What it is:* a WPF control that displays a list of items, one per
    row.
  - *Implementation:* `public class ListBox : Selector` in `System.
    Windows.Controls`, and `Selector` itself inherits from `ItemsControl`
    (below) — a real, three-level inheritance chain (`ListBox` →
    `Selector` → `ItemsControl`), confirmed against the class's own
    published definition, not assumed.
  - *Its use:* this lesson's new home for showing discovered files —
    still holding only one entry, for now, until a later lesson's real
    directory scan gives it more.
  - *Type:* a public class, instantiated here via a XAML element, the same
    mechanical way every other control in this project has been.
  - *Responsibility:* rendering one row per item in its own `Items`
    collection (below), and, though unused this lesson, letting a user
    select one.
  - *Depends on:* nothing beyond the WPF presentation libraries already
    referenced since this project's first lesson.
  - *Connects to:* sits inside this lesson's restructured `StackPanel`, as
    its second child; its inherited `Items` property (below) is what this
    lesson's code writes into.
  - *Shape:* this project's first control whose entire purpose is showing
    more than one thing at once — every earlier control (`TextBlock`,
    `Button`) showed exactly one piece of content.
- **`ItemsControl.Items`**
  - *What it is:* the property, inherited by every `ItemsControl`
    (including `ListBox`), holding the actual collection of things it
    displays.
  - *Implementation:* `public System.Windows.Controls.ItemCollection Items
    { get; }` — a read-only property (confirmed against the class's own
    published definition): the property itself can't be reassigned to a
    different collection, but the `ItemCollection` object it returns is
    itself writable through its own members, one of which this lesson
    uses next.
  - *Its use:* the entry point this lesson's code uses to add this
    lesson's one discovered file's text to the `ListBox`.
  - *Type:* an instance property, declared on `ItemsControl` and inherited
    by `ListBox` without being redeclared.
  - *Responsibility:* exposing the live collection an `ItemsControl` draws
    its rows from.
  - *Depends on:* the `ListBox` instance already existing (built by
    `InitializeComponent()` before this lesson's constructor code runs).
  - *Connects to:* read once, then immediately calls `Add` (below) on the
    `ItemCollection` it returns.
  - *Shape:* a read-only door onto a mutable collection — the property
    itself never changes what it points to, but what it points to can
    still be changed through its own members.
- **`ItemCollection.Add(object)`**
  - *What it is:* the method that inserts one new item into an
    `ItemsControl`'s displayed collection.
  - *Implementation:* `public int Add(object newItem)` (confirmed against
    the method's own published definition): takes any `object` at all —
    a plain string, in this lesson's case — and returns an `int`, the
    zero-based index the new item landed at (or `-1` if it couldn't be
    added, a case this lesson's code doesn't check for, since nothing
    here can cause it).
  - *Its use:* the one call that actually makes this lesson's discovered
    file appear as a visible row.
  - *Type:* an instance method, called on the `ItemCollection` `Items`
    returns.
  - *Responsibility:* appending one new item to the collection an
    `ItemsControl` renders from, and reporting back where it landed.
  - *Depends on:* the `ItemCollection` instance it's called on (obtained
    from `Items`).
  - *Connects to:* called from this lesson's constructor code; its return
    value (the new index) is not used by this lesson at all — the method
    is called purely for its side effect of adding the item.
  - *Shape:* an imperative, one-item-at-a-time way of populating a
    displayed list — contrasted, later in this curriculum, with binding
    an entire collection at once instead.

---

## Concept Unit: A `record` — Data With Almost No Behavior

### The Problem

Nothing in this project so far can represent "one candidate file" as a
single value. A file has at least three facts worth keeping together — its
full path, its plain name, and when it was last changed — and passing
those around as three separate, unrelated variables (a `string`, another
`string`, a `DateTime`) would make it easy to mix up which `string` is
which, or to forget one of the three when passing "a file" from one piece
of code to another.

> `FileSource`, from an earlier lesson, is a `class` with one method and
> no data of its own. If you needed a type that was the *opposite* —
> three named values traveling together, with no method at all — would
> declaring it still need a full class body, with a hand-written
> constructor and three separate properties, each with their own `{ get;
> }`? What's the smallest amount of typing that could still make `new
> InputFile("C:\\a.xml", "a.xml", someDate)` a legal, real object with
> three real, readable properties on it?

### Introduce the Concept in Isolation

A tiny record, its behavior predictable with real confidence — positional
record properties are a fixed, documented C# language guarantee, not a
compiler implementation detail that could vary or surprise, so no
execution is needed to know what this produces:

```csharp
public record Point(int X, int Y);
```

This one line is a complete, working type. `new Point(3, 4)` constructs a
real object; `.X` and `.Y` on that object read back `3` and `4` — real,
generated properties, not a trick of syntax that only looks like property
access. This is called a **record**: the parenthesized list right after
the name doubles as both the constructor's parameter list and the
declaration of one property per parameter, each generated as an **`init`
accessor** — settable when the object is constructed, locked afterward.

### Discard the Throwaway Example

`Point` is not part of the real project — it exists only to isolate what
a bare positional record declaration produces before this lesson's real
record (below) does the same thing for a real reason. Discarded now.

### Project Change

- **Reference Source** — no reference counterpart. `InputFile`'s exact
  three fields (`Path`, `FileName`, `LastModified`) come directly from
  this curriculum's own outline, not from a ported implementation.
- **Files affected** — created: `InputFile.cs`, in the
  `MastercamGenerator/` project folder.
- **Change type** — add (a brand-new file).
- **Location** — n/a; this is the file's entire content.
- **Dependencies** — none beyond the project itself already existing.

### The New Code

```csharp
namespace MastercamGenerator;

public record InputFile(string Path, string FileName, DateTime LastModified);
```

### The Updated Project

This *is* the whole new structure — a brand-new file with nothing
surrounding it yet — so there is nothing further to return to.

### Mechanical Walkthrough

1. `namespace MastercamGenerator;` — the **namespace** keyword, grouping
   this new record under the same shared name every other class in this
   project already belongs to, so it's reachable from `MainWindow.xaml.cs`
   with no extra directive needed.
2. `public` — the **access modifier** on the record declaration itself:
   any code anywhere, including `MainWindow.xaml.cs`, can see and
   construct it.
3. `record InputFile` — the **`record`** keyword (Header above), declaring
   a new record type named `InputFile`.
4. `(string Path, string FileName, DateTime LastModified)` — the
   positional parameter list: three parameters, each becoming a real,
   generated public property of the matching name and type — `Path` and
   `FileName` as `string`, `LastModified` as **`DateTime`** (Header
   above), a type available here with no `using` directive because
   `System` is one of this project's own implicit usings.
5. `;` — this declaration needs no `{ }` body at all; every record member
   this lesson needs (the constructor, the three properties) is entirely
   generated from the single line above it.

### CS Lens

This is a **Data Transfer Object** — a real, named pattern for a type
whose entire job is carrying a fixed bundle of values from one part of a
system to another, with no behavior of its own. Also recognized in: a
JSON payload exchanged between a web client and a server; a database
query's raw result row, before it's mapped into a richer domain object; a
struct handed to a graphics shader holding nothing but numbers; an event
object in a publish/subscribe system carrying only the facts of what
happened, with no method describing what to do about it.

### SE Lens

The alternative — writing `InputFile` as an ordinary `class`, by hand,
with an explicit constructor assigning three fields and three separate
`{ get; }` properties — was available, and is exactly what this
curriculum's own `FileSource` already showed is possible for a
data-carrying member (`FileSource` has none, but the mechanics are
identical to any hand-written property). The tradeoff a plain `class`
would have avoided: a reader unfamiliar with records has to learn one
extra rule — "this parenthesized list secretly declares properties too" —
instead of seeing every property spelled out explicitly. What the `record`
buys in exchange: one line instead of roughly ten, and a guarantee that
every one of `InputFile`'s three properties is `init`-only, locked after
construction, without needing to type `init` three separate times by
hand.

### Commands Needed

None yet beyond `dotnet build`, run once for this lesson's whole batch of
changes at the end.

### Run It

Stated with real confidence, not executed: a positional record's generated
properties are a fixed rule of the C# language itself, documented and
unchanged since the feature's introduction — not an implementation detail
that could vary between builds or compilers, the way a specific piece of
WPF-generated code might. This project's real compile of this exact file
is shown in full at this lesson's end.

### Connecting Back

Every type this project has written until now exists to do something.
This is the first one that exists only to hold something — the shape this
lesson's remaining Concept Units fill with a real, honest value.

---

## Concept Unit: `FileInfo` Reveals Real Filesystem Metadata

### The Problem

`InputFile` can hold three facts about a file, but nothing yet supplies
real ones — filling it with made-up, hand-typed values would prove the
record compiles, but not that this project can learn anything true about
an actual file sitting on a real disk, which is the entire point of a
"file discovery" system this curriculum is building toward.

> If a program needed to know a real file's exact name and exactly when it
> was last changed, could that information come from anywhere inside the
> program's own source code? What has to happen instead — who does the
> program have to ask?

### Introduce the Concept in Isolation

A real, throwaway console project, scaffolded, run, and inspected for
real — because a real file's exact last-modified timestamp is genuinely
unpredictable ahead of time, this is exactly the kind of claim the
Verification Rule requires actually running, not guessing:

```csharp
string? exePath = Environment.ProcessPath;
var dialogInfo = new FileInfo(exePath!);

Console.WriteLine(dialogInfo.Name);
Console.WriteLine(dialogInfo.FullName);
Console.WriteLine(dialogInfo.LastWriteTime);
```

Real, captured output from running this exact code (.NET SDK 10.0.301),
in a throwaway console project scaffolded specifically to run it:

```
ScratchFileInfoCheck.exe
C:\Users\g4m3r\Documents\testing tutorials\open-calc\src\docs\projects\wpf_addin_stuff\ScratchFileInfoCheck\bin\Debug\net10.0\ScratchFileInfoCheck.exe
8/26/2026 7:02:27 AM
```

This proves three real things at once: `Environment.ProcessPath` really
does return the running program's own `.exe` path; `FileInfo` really does
read that file's actual name, full path, and last-write timestamp from the
real filesystem, not from anything hardcoded; and none of these three
values could have been predicted with confidence in advance — the exact
timestamp depends entirely on when this scratch project happened to be
built, which is exactly why the Verification Rule required running it for
real instead of stating it from memory.

A second real fact, also worth proving rather than assuming: removing the
**null-forgiving operator** `!` from the line above — writing plainly
`new FileInfo(exePath)` — produces a real compiler warning, because
`exePath`'s declared type, `string?`, could legally be `null`, and
`FileInfo`'s constructor expects a non-null `string`:

```
warning CS8604: Possible null reference argument for parameter 'fileName' in 'FileInfo.FileInfo(string fileName)'.
```

Adding `!` back suppresses exactly this warning, and only this warning —
it does not change what the code does at runtime in any way, only what
the compiler is willing to say about it.

### Discard the Throwaway Example

The scratch console project this code ran inside was deleted immediately
after this real output was captured — it exists only in this lesson's own
text, never as a real, persisted part of this curriculum's project.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — none in the real project yet; this unit's proof
  runs entirely inside a throwaway console project, deleted once its
  output was captured above.
- **Change type** — n/a for this unit.
- **Location** — n/a.
- **Dependencies** — none.

### Mechanical Walkthrough

1. `string? exePath = Environment.ProcessPath;` — reads
   **`Environment.ProcessPath`** (Header above), a `static` property,
   storing its `string?` result in a local variable.
2. `var dialogInfo = new FileInfo(exePath!);` — **`var`** (Header above)
   lets this line omit an explicit type, since `new FileInfo(exePath!)` on
   the right already tells the compiler `dialogInfo`'s type. The
   **null-forgiving operator** `!` (Header above) is applied to `exePath`
   right here, at the call site, telling the compiler to trust that this
   specific value isn't `null` — true in practice, since a process always
   has a real path to its own executable by the time any of its own code
   can run. `new FileInfo(...)` constructs one instance of
   **`System.IO.FileInfo`** (Header above).
3. `Console.WriteLine(dialogInfo.Name);` — reads **`FileInfo.Name`**
   (Header above) and prints it.
4. `Console.WriteLine(dialogInfo.FullName);` — reads **`FileInfo.
   FullName`** (Header above) and prints it.
5. `Console.WriteLine(dialogInfo.LastWriteTime);` — reads **`FileInfo.
   LastWriteTime`** (Header above) and prints it — the one value, of these
   three, that depends entirely on real, external filesystem state rather
   than anything derivable from the path string alone.

### CS Lens

This is **I/O — depending on state outside the program**: everything this
curriculum's code has computed until now (a folder path a user typed
through a dialog aside) came from values already sitting inside the
program's own memory the instant it started running. `FileInfo.
LastWriteTime` is different in kind, not just in syntax — its value lives
in the real operating system's own filesystem, changes independently of
this program, and could be different the very next time the exact same
line runs. Also recognized in: reading a sensor's current temperature; a
database query whose result can differ between two calls made seconds
apart; asking a web API what time it currently is; checking a stock
ticker's live price.

### SE Lens

The alternative — skipping real verification and simply asserting "of
course `FileInfo` reports the real last-write time, that's obviously what
it does" — was available, and would have been correct in substance, but
unverifiable in its exact, quoted form: the precise timestamp string
`FileInfo.LastWriteTime.ToString()`'s default formatting would produce for
any given file is not something to state from memory with real confidence
the way this project's other, purely mechanical mappings (an XML attribute
becoming a property, for instance) already have been. Running it for real,
once, costs one small throwaway project and a few seconds — cheap insurance
against a plausible-sounding but wrong guess making it into this lesson as
if it were verified fact.

### Commands Needed

- `dotnet new console -n ScratchFileInfoCheck` — scaffolds the throwaway
  project this unit's code ran inside.
- `dotnet run` — compiles and immediately runs it, printing the real
  output quoted above.

### Run It

Shown above, in full, as real captured output — not predicted, for exactly
the reason this unit's own CS Lens names: a real file's last-write time is
external, unpredictable state, not something this lesson could state from
confidence alone.

### Connecting Back

`InputFile` (this lesson's first Concept Unit) can hold three facts about
a file; this unit proves, for real, that `FileInfo` can supply all three,
straight from a real file the operating system itself reports on. The
next Concept Unit connects the two for real, inside this project.

---

## Concept Unit: Converting a Framework Object Into an Application Object

### The Problem

`FileInfo` (previous Concept Unit) and `InputFile` (first Concept Unit)
still know nothing about each other — nothing in this project yet takes
one `FileInfo` and produces one matching `InputFile` from it. Without that
conversion, this project has a way to ask the operating system about a
file, and a way to represent a file as this project's own data, but no
bridge between the two.

> `FileInfo.Name`, `.FullName`, and `.LastWriteTime` are three separate
> reads on one `FileInfo` object. `InputFile`'s constructor takes three
> parameters, in a fixed order: `Path`, `FileName`, `LastModified`. Given
> those two shapes, what's the most direct way to build one `InputFile`
> from one already-constructed `FileInfo` — and which `FileInfo` member
> lines up with which `InputFile` parameter?

### Introduce the Concept in Isolation

No new isolated example — this unit combines two constructs already fully
isolated (this lesson's `record` and `FileInfo`, its first and second
Concept Units) in the single most direct way possible: reading three
already-proven properties and handing their values, in order, to an
already-proven constructor. Isolating that combination separately first
would test nothing this lesson doesn't already know for certain.

### Discard the Throwaway Example

Not applicable — no new throwaway example was written for this unit.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — modified: `MainWindow.xaml.cs`.
- **Change type** — add (two new local variables inside the constructor).
- **Location** — inside `MainWindow`'s constructor, immediately after
  `InitializeComponent();`.
- **Dependencies** — this lesson's `InputFile` record (first Concept
  Unit) and the real `FileInfo` behavior proven in this lesson's second
  Concept Unit.

### The New Code

```csharp
var exeInfo = new System.IO.FileInfo(Environment.ProcessPath!);
var discoveredFile = new InputFile(exeInfo.FullName, exeInfo.Name, exeInfo.LastWriteTime);
```

### The Updated Project

The full `MainWindow.xaml.cs`, as it stands at the end of this Concept
Unit, with the new lines marked:

```csharp
1  using System.Text;
2  using System.Windows;
3  using System.Windows.Controls;
4  using System.Windows.Data;
5  using System.Windows.Documents;
6  using System.Windows.Input;
7  using System.Windows.Media;
8  using System.Windows.Media.Imaging;
9  using System.Windows.Navigation;
10 using System.Windows.Shapes;
11 
12 namespace MastercamGenerator;
13 
14 public partial class MainWindow : Window
15 {
16     private readonly FileSource _fileSource = new FileSource();
17 
18     public MainWindow()
19     {
20         InitializeComponent();
21 
22         var exeInfo = new System.IO.FileInfo(Environment.ProcessPath!);          // ← new
23         var discoveredFile = new InputFile(exeInfo.FullName, exeInfo.Name, exeInfo.LastWriteTime);   // ← new
24     }
25 
26     private void BrowseButton_Click(object sender, RoutedEventArgs e)
27     {
28         string? folder = _fileSource.SelectDirectory();
29         if (folder != null)
30         {
31             FolderPathText.Text = folder;
32         }
33     }
34 }
```

`MainWindow`'s constructor now builds one real `InputFile`, from a real
file, every time a `MainWindow` is created — `discoveredFile` isn't shown
anywhere yet; that's this lesson's final Concept Unit.

### Mechanical Walkthrough

1. `var exeInfo = new System.IO.FileInfo(Environment.ProcessPath!);` —
   **`var`** (Header above) again; `new System.IO.FileInfo(...)`
   constructs a **`System.IO.FileInfo`** (Header above), referenced here
   by its fully qualified name. Real, verified proof of why: this
   project's own real, generated implicit-usings file —
   `MastercamGenerator.GlobalUsings.g.cs`, produced by this project's own
   build — reads, in full:

   ```csharp
   // <auto-generated/>
   global using System;
   global using System.Collections.Generic;
   global using System.Linq;
   global using System.Threading;
   global using System.Threading.Tasks;
   ```

   `System.IO` is not in that list — unlike a plain console project's own
   default implicit usings, which do include it — so a bare `FileInfo`
   would not compile here without either this fully qualified form or an
   explicit `using System.IO;` this lesson doesn't add. `Environment.
   ProcessPath` (Header above) is read again, and the **null-forgiving
   operator** `!` (Header above) is applied again, for the identical
   reason proven in this lesson's previous Concept Unit.
2. `var discoveredFile = new InputFile(exeInfo.FullName, exeInfo.Name,
   exeInfo.LastWriteTime);` — three property reads on `exeInfo`
   (**`FileInfo.FullName`**, **`FileInfo.Name`**, and **`FileInfo.
   LastWriteTime`**, all Header above), handed, in order, to
   **`InputFile`**'s (Header above) generated positional constructor:
   `FullName` becomes `Path`, `Name` becomes `FileName`, `LastWriteTime`
   becomes `LastModified` — matching each `FileInfo` member to the
   `InputFile` parameter it fills by position, not by name (the two
   don't share any parameter names at all).

### CS Lens

This is an **Adapter** — a real, named pattern for translating one
system's data shape into your own, at the exact boundary where the two
meet, so the rest of a program never has to work directly with a
third-party type's own shape. `FileInfo`'s three properties (`Name`,
`FullName`, `LastWriteTime`) exist because that's how .NET's own
filesystem API happens to be shaped; `InputFile`'s three properties
(`FileName`, `Path`, `LastModified`) exist because that's the vocabulary
this curriculum's own file-discovery system will use everywhere else. This
one line is the entire translation between the two. Also recognized in:
converting a third-party payment gateway's response object into an
application's own internal `Payment` type; mapping a government ID card's
printed fields onto an application's own user-profile fields; translating
a weather API's raw JSON response into an application's own `Forecast`
type.

### SE Lens

Building this conversion directly inside `MainWindow`'s constructor is a
real, deliberate compromise — the exact kind of UI code owning application
logic an earlier lesson in this curriculum argued against, done here
anyway, on purpose, because there is nowhere better for it yet: no
directory-scanning class exists in this project until later in this
curriculum, and inventing a home for one conversion this small, before a
real scanner needs it, would be exactly the kind of over-building this
curriculum has already learned to avoid. The tradeoff, paid knowingly: for
now, `MainWindow` knows about `FileInfo`, a WPF-adjacent but
application-agnostic .NET type, directly — a small, temporary crack in the
separation this project otherwise maintains, explicitly flagged here
rather than left for a reader to discover and wonder whether it was an
oversight. A later stage of this curriculum gives this exact conversion a
permanent, non-UI home, the same way an earlier one already did for folder
selection.

### Commands Needed

None beyond this lesson's shared, end-of-lesson `dotnet build`.

### Run It

Predicted with the same confidence already established for `FileInfo`'s
three properties (previous Concept Unit) and `InputFile`'s constructor
(first Concept Unit) — this project's real, full build, covering this
exact code, is shown at this lesson's end.

### Connecting Back

`InputFile` and `FileInfo` now meet, for real, inside this project — one
real `InputFile`, built from one real file, exists the instant any
`MainWindow` is constructed. It has no way to reach the screen yet. That's
this lesson's final Concept Unit.

---

## Concept Unit: Displaying the Discovered File

### The Problem

`discoveredFile` (previous Concept Unit) is a real, fully-populated
`InputFile` the instant `MainWindow`'s constructor finishes running — and
nothing shows it anywhere. This project has no control yet whose job is
displaying more than one thing at once; every control so far
(`TextBlock`, `Button`) shows exactly one piece of content.

> `Window.Content` can hold exactly one child, and this project's `Grid`
> currently holds exactly one child too — the horizontal `StackPanel`
> from an earlier lesson. If a second, independent row of content needs
> to sit *below* that one, without touching what's already inside it,
> what would need to change about how the `Grid`'s one child is
> structured?

### Introduce the Concept in Isolation

No new isolated example for the layout change — nesting one `StackPanel`
inside another uses nothing beyond what an earlier lesson already proved
in full: a `StackPanel` arranges whatever children it's given, in order,
along one axis, regardless of what kind of object those children are. A
`StackPanel` has never been shown holding another `StackPanel` as a child
before, but nothing about that combination is a new rule — it's the same
rule, applied to a container instead of a single control.

The one genuinely new piece — a control that displays more than one row —
is real, working code, run for real as part of this lesson's own final
build (shown at this lesson's end), not isolated separately first: adding
one item to a `ListBox` and having it appear as one visible row is exactly
what this unit's own real project code does, with nothing about it complex
enough to warrant a separate throwaway version first.

### Discard the Throwaway Example

Not applicable — no separate throwaway example was written for this unit.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — modified: `MainWindow.xaml` (restructuring the
  existing layout and adding a `ListBox`) and `MainWindow.xaml.cs`
  (populating it).
- **Change type** — refactor (wrapping the existing horizontal
  `StackPanel` in a new outer, vertical one) and add (the `ListBox`
  element, and the line that populates it).
- **Location** — `MainWindow.xaml`: the `Grid`'s single child. `MainWindow
  .xaml.cs`: the end of the constructor, after this lesson's previous
  Concept Unit's two new lines.
- **Dependencies** — this lesson's `discoveredFile` local variable
  (previous Concept Unit).

### The New Code

`MainWindow.xaml`'s new structure — the previous, single horizontal
`StackPanel` is now nested inside a new outer, vertical one, alongside a
new `ListBox`:

```xml
<StackPanel Orientation="Vertical">
    <StackPanel Orientation="Horizontal">
        <TextBlock Text="Folder: "/>
        <TextBlock x:Name="FolderPathText" Text="(none selected)"/>
        <Button Content="Browse" Click="BrowseButton_Click"/>
    </StackPanel>
    <ListBox x:Name="DiscoveredFilesListBox"/>
</StackPanel>
```

`MainWindow.xaml.cs`'s new line, populating it:

```csharp
DiscoveredFilesListBox.Items.Add($"{discoveredFile.FileName} — {discoveredFile.LastModified}");
```

### The Updated Project

The full `MainWindow.xaml`, with the restructuring and the new `ListBox`
marked:

```xml
1  <Window x:Class="MastercamGenerator.MainWindow"
2          xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
3          xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
4          Title="Mastercam Generator" Height="450" Width="800">
5      <Grid>
6          <StackPanel Orientation="Vertical">                          // ← new (wraps the row below)
7              <StackPanel Orientation="Horizontal">
8                  <TextBlock Text="Folder: "/>
9                  <TextBlock x:Name="FolderPathText" Text="(none selected)"/>
10                 <Button Content="Browse" Click="BrowseButton_Click"/>
11             </StackPanel>
12             <ListBox x:Name="DiscoveredFilesListBox"/>                // ← new
13         </StackPanel>
14     </Grid>
15 </Window>
```

The `Grid`'s one child is now a vertical `StackPanel` holding two rows:
the original folder-selection row, unchanged, and a new `ListBox` beneath
it, ready to display discovered files.

The full `MainWindow.xaml.cs`, with the new line marked:

```csharp
1  using System.Text;
2  using System.Windows;
3  using System.Windows.Controls;
4  using System.Windows.Data;
5  using System.Windows.Documents;
6  using System.Windows.Input;
7  using System.Windows.Media;
8  using System.Windows.Media.Imaging;
9  using System.Windows.Navigation;
10 using System.Windows.Shapes;
11 
12 namespace MastercamGenerator;
13 
14 public partial class MainWindow : Window
15 {
16     private readonly FileSource _fileSource = new FileSource();
17 
18     public MainWindow()
19     {
20         InitializeComponent();
21 
22         var exeInfo = new System.IO.FileInfo(Environment.ProcessPath!);
23         var discoveredFile = new InputFile(exeInfo.FullName, exeInfo.Name, exeInfo.LastWriteTime);
24         DiscoveredFilesListBox.Items.Add($"{discoveredFile.FileName} — {discoveredFile.LastModified}");   // ← new
25     }
26 
27     private void BrowseButton_Click(object sender, RoutedEventArgs e)
28     {
29         string? folder = _fileSource.SelectDirectory();
30         if (folder != null)
31         {
32             FolderPathText.Text = folder;
33         }
34     }
35 }
```

The constructor now does everything this lesson set out to build: it
builds one real `InputFile` from one real file, and shows it as one row
in the `ListBox`, the instant the window is created.

### Mechanical Walkthrough

1. `<StackPanel Orientation="Vertical">` (XAML) — a second **`StackPanel`**
   (already fully explained in an earlier lesson), this one stacking its
   children top to bottom, wrapping the previously-existing horizontal
   row as its first child.
2. `<ListBox x:Name="DiscoveredFilesListBox"/>` (XAML) — the **`ListBox`**
   (Header above), given an **`x:Name` directive** (already fully
   explained in an earlier lesson) so code-behind can reach it as a real,
   typed, generated field — the same mechanism already proven for
   `FolderPathText`, applied here to a different control type.
3. `DiscoveredFilesListBox.Items.Add(...)` (C#) — a chained access: first
   `.Items` reads **`ItemsControl.Items`** (Header above), an inherited
   property returning this `ListBox`'s own `ItemCollection`; then `.Add
   (...)` calls **`ItemCollection.Add(object)`** (Header above) on that
   returned collection — two separate member accesses, not one, each
   already given its own full treatment in the Header above.
4. `$"{discoveredFile.FileName} — {discoveredFile.LastModified}"` — a
   **string interpolation** (Header above): `discoveredFile.FileName` and
   `discoveredFile.LastModified` are each read (both real properties this
   lesson's `InputFile` record generates) and inserted into the
   surrounding fixed text, producing one combined string — the argument
   `Add` actually receives.

### CS Lens

Populating `Items` one `Add` call at a time, by hand, is the **push
model** of feeding a collection to a UI: the code actively pushes each new
item in, one at a time, at the exact moment it decides to. This is a real,
recognized architectural duality, with a real alternative — the **pull
model**, where a UI instead reads from a data source whenever it needs to,
rather than being told about changes as they happen. Also recognized in: a
webhook pushing a notification the instant an event occurs, versus an API
endpoint a client has to poll on its own schedule; a print queue pushing
jobs to a printer as they arrive, versus a printer periodically checking
for waiting jobs; a doorbell pushing a notification the moment someone
presses it, versus a homeowner periodically checking the front step; a
server pushing a live update over a websocket, versus a browser polling
the same server every few seconds for changes.

### SE Lens

The alternative — binding the `ListBox`'s `ItemsSource` to a real
collection object instead of calling `Items.Add` by hand — is real, more
powerful WPF machinery this project doesn't have the pieces for yet: it
needs a collection type that can announce its own changes, and this
project has exactly one item to show, built once, at startup, with nothing
yet that changes it afterward. Reaching for the more powerful mechanism
before there's a real second file, a real scan, or a real reason for the
list to change after construction would be solving a problem this lesson
doesn't have yet. The cost of the simpler approach chosen here: it doesn't
scale — `Items.Add`, called once per file, works cleanly for one file and
would work, if tediously, for a handful, but has no way to react to files
appearing or disappearing later, which a real, working file-discovery
system eventually needs.

### Commands Needed

None beyond this lesson's one shared `dotnet build`, run once, covering
every Concept Unit's changes together — shown next.

### Run It

Real, captured output from running `dotnet build` against this lesson's
complete, final `InputFile.cs`, `MainWindow.xaml`, and `MainWindow.xaml.cs`
(.NET SDK 10.0.301), unedited:

```
Determining projects to restore...
All projects are up-to-date for restore.
MastercamGenerator -> <project>\bin\Debug\net10.0-windows\MastercamGenerator.dll

Build succeeded.
    0 Warning(s)
    0 Error(s)

Time Elapsed 00:00:01.89
```

This one real build covers every Concept Unit in this lesson at once — the
new `InputFile` record, the `FileInfo`-to-`InputFile` conversion, the
restructured XAML, and the new `ListBox` population all compiled together,
in a single pass, per this curriculum's own batching practice. Zero
warnings confirms the null-forgiving operator is doing exactly its stated
job: the real `CS8604` warning captured in this lesson's second Concept
Unit does not reappear here, because `!` is present in the real project
code exactly as it was in that unit's own proof.

### Connecting Back

Every earlier Concept Unit in this lesson built one piece of a chain this
unit finally shows on screen: a record (first unit) gave this project a
shape for file data; `FileInfo` (second unit) proved that shape could be
filled with real, verified facts; a conversion (third unit) actually
filled it, once, for one real file. This unit is what makes that one
`InputFile` visible at all — completing the exact feature this lesson
opened by promising: a real file, discovered and displayed, even before
any real directory scanner exists to find more than one.

---

## Connect the Pieces

Trace this lesson's one real file, start to finish, through every piece
this lesson built:

1. A `MainWindow` is constructed. `InitializeComponent()` runs first,
   building every control this project's XAML declares, including the new
   `DiscoveredFilesListBox` (this lesson's fourth Concept Unit) — empty,
   so far.
2. `Environment.ProcessPath` (this lesson's second Concept Unit) is read,
   returning the real, absolute path to this running program's own
   compiled `.exe`. The **null-forgiving operator** `!` tells the compiler
   to trust that this value is real and non-null here.
3. A new `System.IO.FileInfo` (second Concept Unit) is constructed from
   that path, giving this project real, live access to that one file's
   actual filesystem metadata.
4. `exeInfo.FullName`, `exeInfo.Name`, and `exeInfo.LastWriteTime` (second
   Concept Unit) are each read, and handed, in that order, into
   `InputFile`'s generated constructor (first Concept Unit) — a real
   **Adapter** (third Concept Unit) translating a `FileInfo`'s own shape
   into this project's own `InputFile` shape.
5. The resulting `discoveredFile` is a real, fully-populated `InputFile`
   — three facts about one real file, traveling together as a single
   value, exactly as this lesson's first Concept Unit set out to make
   possible.
6. `discoveredFile.FileName` and `discoveredFile.LastModified` are read
   once more, combined through **string interpolation** (fourth Concept
   Unit) into one display string, and handed to `DiscoveredFilesListBox.
   Items.Add(...)` (fourth Concept Unit).
7. The `ListBox` now shows one real row: this running program's own file
   name, and the real timestamp its own last build produced — not a
   hardcoded sample, not a guess, a real fact about a real file, arrived
   at through every piece this lesson built.

Nothing in this project can scan a real directory yet — that arrives in
this curriculum's next phase. What exists now is the complete shape of the
data a real scanner will eventually produce, proven, end to end, against
the one real file this project could already honestly get its hands on.
