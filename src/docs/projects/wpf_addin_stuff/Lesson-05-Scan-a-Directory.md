# Lesson 5: Filtering the Real World — Scanning a Directory

**What you will build.** A `DirectoryScanner` class that receives a real
directory path, filters it down to just the XML files sitting directly
inside it, and hands each one back as a real `InputFile`. Wiring it into
the `Browse` button means picking a folder now shows every real XML file
discovered in it, with a "Files Found" count, replacing an earlier
lesson's explicitly-provisional single-file stand-in for good. What this
lesson is actually about goes past this one class: everything this
project has read from disk so far was exactly one predetermined file,
known in advance. This is the first lesson where the program has to work
with a real, previously-unknown-in-count set of things at once —
filtering which ones qualify, transforming each one into this project's
own shape, and collecting the results into something that can be counted
and shown — three habits that recur constantly in real software, well
beyond this one project.

**What you need to know first.** Lesson 3 — the `FileSource` pattern (a
plain class `MainWindow` calls into, not logic living in the constructor),
which this lesson deliberately follows for `DirectoryScanner`, paying off
a debt an earlier lesson explicitly flagged rather than hid. Lesson 4 —
the `InputFile` record, `FileInfo`'s real `Name`/`FullName`/
`LastWriteTime` properties, and the conversion pattern that turns a
`FileInfo` into an `InputFile`, reused here rather than re-derived.

**Terms used in this lesson.**

- **array (`T[]`)** — a C# data structure holding a fixed number of
  values of the same type, laid out contiguously and accessed by a
  zero-based integer index (`array[0]`, `array[1]`, and so on), written as
  the element type followed by square brackets (`FileInfo[]`). It exists
  as the most basic possible way to represent "more than one of the same
  kind of thing" — many other collection types in .NET (including this
  lesson's `List<T>`, below) are themselves built on top of arrays
  internally.
- **generic type (`List<T>`)** — a C# type that isn't fully specified
  until it's used with a real type filled in for `T` — `List<InputFile>`
  is "a list, specifically of `InputFile` objects," while `List<string>`
  would be "a list, specifically of strings," both built from the exact
  same underlying `List<T>` declaration. It exists so a single, real,
  tested implementation of "a growable, ordered collection" can be
  written once and reused for any element type at all, instead of writing
  a separate `InputFileList` class, a separate `StringList` class, and so
  on, one per type that ever needs to be collected — each one identical
  in every way except which type it holds.
- **`foreach` loop** — a C# control-flow statement that runs its body
  once for every item in a collection, in order, automatically handling
  "where am I in the collection" without a hand-managed counter variable.
  Written as `foreach (var item in collection) { ... }`, with `item`
  taking on each element's value, one at a time, across successive runs
  of the loop body. It exists because "do this once for every item in a
  collection" is one of the most common things any program does, and
  writing it with a manually incremented index (as an older-style loop
  would) invites off-by-one mistakes `foreach` makes structurally
  impossible — there's no index to get wrong in the first place.
- **`try`/`catch`** — a C# construct for running code that might fail in a
  way the program can recover from, without letting that failure crash the
  whole program. Code inside a `try` block runs normally until (and
  unless) something goes wrong; if it does, execution jumps immediately to
  a matching `catch` block instead of continuing where it left off, and
  the program keeps running from there. It exists because some failures
  are genuinely expected and recoverable (a directory that no longer
  exists by the time it's scanned, for instance) rather than proof of a
  bug — `try`/`catch` is how a program states, explicitly, "this specific
  kind of failure is anticipated, and here's what to do instead of
  crashing."
- **`var` (implicit typing)** — a C# keyword letting a local variable's
  declaration omit its explicit type, leaving the compiler to infer it
  from whatever is immediately assigned to it. It exists purely to reduce
  repetition: stating a constructed type's name once, on the right-hand
  side of `new`, is enough for the compiler to know the variable's type
  without also spelling it out, redundantly, on the left.

**Objects and methods used.**

- **`DirectoryScanner`**
  - *What it is:* this project's new class representing "something that
    can look inside a real directory and report which XML files it
    contains."
  - *Implementation:* `public class DirectoryScanner` in the
    `MastercamGenerator` namespace, declared with no base class — the
    same plain-class shape `FileSource` already established for
    application logic that shouldn't live inside `MainWindow`.
  - *Its use:* the new home for this project's real directory-scanning
    logic, called from `BrowseButton_Click` once a folder is chosen.
  - *Type:* a public class, instantiated once, with `new`.
  - *Responsibility:* knowing how to turn one real directory path into a
    list of `InputFile`s describing the XML files found there — and
    nothing about how those results get displayed, which stays
    `MainWindow`'s job.
  - *Depends on:* nothing beyond being constructed; its one method (below)
    does its own filesystem access internally.
  - *Connects to:* constructed once by `MainWindow`, stored in a
    `readonly` field, the same pattern already established for
    `FileSource`; called from `BrowseButton_Click`.
  - *Shape:* a second real dependency boundary in this project, alongside
    `FileSource` — application logic MainWindow calls into, not logic
    tangled into an event handler.
- **`DirectoryScanner.ScanDirectory(string)`**
  - *What it is:* the one method `DirectoryScanner` exposes — given a
    directory path, returns every XML file found directly inside it, as
    `InputFile`s.
  - *Implementation:* `public List<InputFile> ScanDirectory(string
    directoryPath)`.
  - *Its use:* the single call `BrowseButton_Click` makes once a real
    folder has been chosen.
  - *Type:* a public instance method.
  - *Responsibility:* looking inside the given directory, filtering to
    just `.xml` files, converting each one to an `InputFile`, and
    returning the complete collection — or an empty one, if the directory
    turns out not to exist.
  - *Depends on:* a real (or previously-real) directory path being passed
    in.
  - *Connects to:* called from `BrowseButton_Click`; internally
    constructs a `DirectoryInfo`, calls its `GetFiles` (both below), and
    builds one `InputFile` (an earlier lesson's own subject) per result.
  - *Shape:* the one public entry point into this lesson's new class.
- **`System.IO.DirectoryInfo`**
  - *What it is:* a .NET class representing one specific directory on
    disk.
  - *Implementation:* `public class DirectoryInfo` in `System.IO`.
    Because `DirectoryScanner.cs` adds an explicit `using System.IO;`
    directive (this lesson's own Project Change, below), it's referenced
    here by its short name — unlike an earlier lesson's single, one-off
    use of a `System.IO` type, which stayed fully qualified because
    adding a whole `using` directive for exactly one mention wasn't worth
    it; this file uses three separate `System.IO` types, which is exactly
    the situation a `using` directive is for.
  - *Its use:* the starting point for asking the real filesystem what's
    inside a given directory.
  - *Type:* a public class, instantiated with `new`, given a directory
    path as its one constructor argument.
  - *Responsibility:* representing one directory and providing access to
    what it actually contains, as reported by the real operating system.
  - *Depends on:* a path string handed to its constructor — notably,
    unlike `GetFiles` (below), simply constructing a `DirectoryInfo` does
    not check whether that path actually exists.
  - *Connects to:* constructed inside `ScanDirectory`; its `GetFiles`
    method (below) is the only member this lesson calls on it.
  - *Shape:* this lesson's bridge from "a plain string a user picked" to
    "a real object that can answer questions about a real directory."
- **`DirectoryInfo.GetFiles(string)`**
  - *What it is:* the method that lists files inside a directory, filtered
    by a search pattern.
  - *Implementation:* `public FileInfo[] GetFiles(string searchPattern)`
    — returns an **array** (Header above) of `FileInfo`, one per matching
    file; real, verified proof that a pattern like `"*.xml"` genuinely
    filters (not just describes an intention) comes from this lesson's
    own throwaway console check, below: a directory holding two `.xml`
    files and one `.txt` file returned exactly the two `.xml` files, in
    a real run, not a prediction.
  - *Its use:* the actual filtering step — the one call that turns "every
    file in this directory" into "just the XML ones."
  - *Type:* an instance method.
  - *Responsibility:* asking the real operating system which files in
    this directory match the given pattern, and reporting them back as
    real `FileInfo` objects.
  - *Depends on:* the directory this method is called on actually
    existing — real, verified proof that it does *not* silently return an
    empty result for a missing directory, but instead throws, comes from
    this lesson's own throwaway console check, below.
  - *Connects to:* called on the `DirectoryInfo` constructed inside
    `ScanDirectory`; its result is iterated by this lesson's `foreach`
    loop.
  - *Shape:* the one call in this entire lesson that can fail loudly
    enough to need a `try`/`catch` around it.
- **`System.Collections.Generic.List<T>`**
  - *What it is:* a growable, ordered collection — the concrete
    **generic type** (Header above) this lesson uses to collect results.
  - *Implementation:* `public class List<T>` in
    `System.Collections.Generic` — available in this file (and every file
    in this project) with no `using` directive needed, since `System.
    Collections.Generic` is one of this project's own real, generated
    implicit usings, proven in an earlier lesson.
  - *Its use:* `List<InputFile>` is the type `ScanDirectory` builds up,
    one item at a time, and returns.
  - *Type:* a public generic class, instantiated with `new List<InputFile>
    ()`.
  - *Responsibility:* holding an ordered sequence of items, and growing
    automatically as more are added — unlike an **array**, above, whose
    size is fixed the moment it's created.
  - *Depends on:* nothing beyond being constructed.
  - *Connects to:* constructed at the top of `ScanDirectory`; filled by
    this lesson's `foreach` loop calling `Add` (below); returned as
    `ScanDirectory`'s own result.
  - *Shape:* the container this lesson's whole method exists to fill and
    hand back.
- **`List<T>.Add(T)`**
  - *What it is:* the method that appends one item to the end of a
    `List<T>`.
  - *Implementation:* `public void Add(T item)` — for a `List<InputFile>`,
    this means `T` is `InputFile`, so `Add` takes exactly one `InputFile`
    argument and returns nothing.
  - *Its use:* called once per XML file found, inside this lesson's
    `foreach` loop.
  - *Type:* an instance method.
  - *Responsibility:* growing the list by exactly one element, at the
    end, each time it's called.
  - *Depends on:* the `List<T>` instance it's called on already existing.
  - *Connects to:* called from inside `ScanDirectory`'s `foreach` loop —
    a different `Add`, on a different type, than an earlier lesson's
    `ItemCollection.Add`, even though both share the name "Add" and the
    same general idea of appending one item.
  - *Shape:* the one write operation this lesson's whole method performs,
    repeated once per discovered file.
- **`System.IO.DirectoryNotFoundException`**
  - *What it is:* the real exception .NET throws when code tries to
    access a directory that doesn't exist.
  - *Implementation:* a class in `System.IO`, inheriting (like most .NET
    exceptions) from `System.Exception` — real, verified proof of its
    exact type and message comes from this lesson's own throwaway console
    check, below: asking a real, nonexistent path for its files produced,
    in an actual run, the type `System.IO.DirectoryNotFoundException` and
    the message `"Could not find a part of the path 'C:\...'."`, not a
    guessed or paraphrased description.
  - *Its use:* the specific exception this lesson's `try`/`catch` (Header
    above) watches for.
  - *Type:* a class, constructed internally by .NET itself, never
    directly by this project's own code.
  - *Responsibility:* signaling, specifically, that a directory operation
    failed because the directory doesn't exist — as opposed to .NET's
    many other, differently-named exception types for other filesystem
    failures (a locked file, a permissions problem, and others this
    lesson's code doesn't handle).
  - *Depends on:* being thrown by `GetFiles` (above) internally.
  - *Connects to:* caught by `ScanDirectory`'s own `catch
    (DirectoryNotFoundException)` block.
  - *Shape:* the one specific, anticipated failure this lesson's code
    is written to survive — not every possible failure, just this one,
    by name.
- **`ItemCollection.Clear()`**
  - *What it is:* the method that removes every item currently in an
    `ItemsControl`'s displayed collection.
  - *Implementation:* `public void Clear()`, on the same `ItemCollection`
    class an earlier lesson's `Add` (a different member of that same
    type) already introduced.
  - *Its use:* called at the start of every scan, so a second `Browse`
    click doesn't just pile new results on top of the previous folder's
    leftover list.
  - *Type:* an instance method.
  - *Responsibility:* emptying the collection completely, releasing its
    references to every item that had been in it.
  - *Depends on:* the `ItemCollection` instance it's called on (obtained
    from `Items`, an earlier lesson's own subject).
  - *Connects to:* called from `BrowseButton_Click`, immediately before
    this lesson's `foreach` loop starts adding the new results.
  - *Shape:* the one piece of this lesson's UI code that isn't about
    scanning at all — it's about making a second scan behave correctly
    given what an earlier lesson's first scan already left behind.

---

## Concept Unit: `DirectoryInfo` and Filtering With `GetFiles`

### The Problem

Nothing in this project can look inside a real directory and report what's
in it. An earlier lesson's `FileInfo` could describe one file this project
already knew the exact path to — but a real "Browse" button hands back a
*folder*, not a specific file, and this project needs to find every XML
file inside whatever folder that turns out to be, without knowing in
advance how many there'll be or what they're named.

> If you had a real folder path as a plain string, and needed to know
> every `.xml` file sitting directly inside it, would you need to open
> each file in the folder just to check its extension, or is there
> something narrower — the way `Environment.ProcessPath` gave an earlier
> lesson exactly the one fact it needed, without opening the file itself —
> that could answer "which files match this pattern" more directly?

### Introduce the Concept in Isolation

A real, throwaway console project, scaffolded and run for real — because
whether `"*.xml"` genuinely filters (rather than merely suggesting an
intention) is exactly the kind of claim the Verification Rule requires
proof for, not a guess:

```csharp
Directory.CreateDirectory(tempDir);
File.WriteAllText(Path.Combine(tempDir, "one.xml"), "<a/>");
File.WriteAllText(Path.Combine(tempDir, "two.xml"), "<a/>");
File.WriteAllText(Path.Combine(tempDir, "notes.txt"), "hello");

var directory = new DirectoryInfo(tempDir);
FileInfo[] xmlFiles = directory.GetFiles("*.xml");

Console.WriteLine($"Found {xmlFiles.Length} xml files:");
foreach (var file in xmlFiles)
{
    Console.WriteLine($"  {file.Name}");
}
```

Real, captured output from running this exact code (.NET SDK 10.0.301),
against a real temporary directory holding two `.xml` files and one
`.txt` file:

```
Found 2 xml files:
  one.xml
  two.xml
```

This proves `GetFiles("*.xml")` genuinely filters by extension — the real
`.txt` file sitting in the exact same directory is simply absent from the
result, not merely unmentioned.

### Discard the Throwaway Example

The temporary directory and the scratch console project it ran inside were
both deleted immediately after this real output was captured — neither
exists as a persisted part of this curriculum's project.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — created: `DirectoryScanner.cs`, in the
  `MastercamGenerator/` project folder.
- **Change type** — add (a brand-new file).
- **Location** — n/a; the start of a new file.
- **Dependencies** — none beyond the project itself already existing.

### The New Code

```csharp
using System.IO;

namespace MastercamGenerator;

public class DirectoryScanner
{
    public List<InputFile> ScanDirectory(string directoryPath)
    {
        var directory = new DirectoryInfo(directoryPath);
        FileInfo[] files = directory.GetFiles("*.xml");
    }
}
```

### The Updated Project

The full `DirectoryScanner.cs`, as it stands at the end of this Concept
Unit:

```csharp
1  using System.IO;
2  
3  namespace MastercamGenerator;
4  
5  public class DirectoryScanner
6  {
7      public List<InputFile> ScanDirectory(string directoryPath)
8      {
9          var directory = new DirectoryInfo(directoryPath);      // ← new
10         FileInfo[] files = directory.GetFiles("*.xml");        // ← new
11     }
12 }
```

This doesn't compile yet on its own — `ScanDirectory` is declared to
return a `List<InputFile>`, but nothing inside it does yet. That's this
lesson's next two Concept Units.

### Mechanical Walkthrough

1. `using System.IO;` — a **`using` directive** (already fully explained
   in an earlier lesson), here bringing `System.IO`'s short type names
   into scope for this whole file, chosen over the fully-qualified form
   an earlier lesson used because this file, unlike that one, uses three
   separate `System.IO` types.
2. `public class DirectoryScanner` — a plain **`class`** (already fully
   explained in an earlier lesson) declaration, no base type, the same
   shape `FileSource` already established.
3. `public List<InputFile> ScanDirectory(string directoryPath)` — a
   method declaration: `public` (an **access modifier**, already fully
   explained); its return type, `List<InputFile>` (a **generic type**,
   Header above) filled in with `InputFile` (an earlier lesson's own
   record) as its type argument; its name, `ScanDirectory`; and one
   parameter, `directoryPath`, of type `string`.
4. `var directory = new DirectoryInfo(directoryPath);` — **`var`** (Header
   above) again; `new DirectoryInfo(directoryPath)` constructs one
   **`System.IO.DirectoryInfo`** (Header above), from the path string
   handed into this method.
5. `FileInfo[] files = directory.GetFiles("*.xml");` — calls **`Directory
   Info.GetFiles(string)`** (Header above) with the literal pattern
   `"*.xml"`, storing its result — an **array** (Header above) of
   `FileInfo` — in a local variable declared with its full type spelled
   out, `FileInfo[]`, rather than `var`, simply as a stylistic choice; both
   would compile identically.

### CS Lens

`"*.xml"` filtering a directory down to only its matching files is a real
instance of the **filter** operation — a computation that takes a
collection and a yes/no test, and produces a smaller collection containing
only the elements that pass. Also recognized in: a spam filter separating
wanted email from unwanted; a coffee filter letting liquid through while
holding back grounds; a search engine's results page showing only pages
matching a query, out of the entire web it has indexed; a spreadsheet's
"Filter" feature hiding every row that doesn't match a chosen condition.

### SE Lens

The alternative — calling `GetFiles()` with no pattern at all, getting
every file in the directory regardless of extension, and then checking
each one's extension by hand in a loop — was available, and would work.
`GetFiles("*.xml")` is chosen instead because the filtering happens once,
at the source, rather than being re-implemented, by hand, inside this
project's own loop logic — a real tradeoff of relying on a framework
method's own documented filtering behavior (trusted, but not something
this project's own code can see happen) against writing the exact same
logic explicitly, visibly, in this project's own code, at the cost of one
more line and one more thing to get right by hand.

### Commands Needed

- `dotnet new console -n ScratchDirectoryScanCheck` — scaffolds the
  throwaway project this unit's code ran inside.
- `dotnet run` — compiles and runs it, printing the real output quoted
  above.

### Run It

Shown above, in full, as real captured output — not predicted, since
whether a search pattern actually filters, rather than merely suggesting
an intention, is not something to state from memory alone.

### Connecting Back

`DirectoryScanner` now has a real way to ask the filesystem for exactly
the files this project cares about. It doesn't yet do anything with what
it finds — that's this lesson's next two Concept Units.

---

## Concept Unit: Collecting Results With `List<T>` and `foreach`

### The Problem

`GetFiles` (previous Concept Unit) hands back an array of `FileInfo`
objects — but `ScanDirectory` is declared to return `List<InputFile>`, a
completely different type, holding this project's own data shape, not
.NET's raw filesystem type. Something has to turn "an array of `FileInfo`,
one per matching file" into "a `List` of `InputFile`, one per matching
file" — and do it once for every single file found, however many that
turns out to be.

> An earlier lesson converted exactly one `FileInfo` into exactly one
> `InputFile`, by hand, with one line of code. If there are now several
> `FileInfo` objects instead of one — and the exact number isn't known
> until the directory is actually scanned — would writing one separate
> conversion line per file, by hand, even be possible? What would a
> program need in order to repeat that same one-file conversion once for
> every file, whatever their number turns out to be?

### Introduce the Concept in Isolation

Two small, uninvolved pieces, their behavior predictable with real
confidence — collecting into a growable list and looping over an array
are both extremely well-established, extensively documented C# behaviors,
not compiler quirks needing fresh proof:

```csharp
var numbers = new List<int>();
numbers.Add(10);
numbers.Add(20);
```

After these three lines, `numbers` holds two elements, `10` then `20`, in
that order — `List<int>` (this lesson's own **generic type** filled in
with `int` this time, instead of `InputFile`) starts empty and grows by
exactly one element per `Add` call.

```csharp
int[] values = { 5, 6, 7 };
foreach (var value in values)
{
    Console.WriteLine(value);
}
```

This prints `5`, then `6`, then `7`, each on its own line — a
**`foreach` loop** runs its body once per element, in order, with `value`
taking on each one in turn; there is no index variable anywhere in this
code for an off-by-one mistake to hide in.

### Discard the Throwaway Example

Neither the `numbers` list nor the `values` array/loop appears in the real
project — both existed only to isolate `List<T>.Add` and `foreach`
separately, before this lesson's real code (next Concept Unit) combines
both for a real reason. Discarded now.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — none yet for this unit specifically; both
  constructs isolated here are combined with real project code in this
  lesson's next Concept Unit.
- **Change type** — n/a for this unit.
- **Location** — n/a.
- **Dependencies** — none.

### Mechanical Walkthrough

1. `var numbers = new List<int>();` — **`var`** (Header above);
   `new List<int>()` constructs an empty **`List<T>`** (Header above),
   with `int` filled in as its type argument this time.
2. `numbers.Add(10);` and `numbers.Add(20);` — two calls to **`List<T>.
   Add(T)`** (Header above), each appending one more element to the end.
3. `int[] values = { 5, 6, 7 };` — an **array** (Header above) literal:
   three `int` values, laid out contiguously, with a fixed length of
   three the moment this line runs.
4. `foreach (var value in values)` — a **`foreach` loop** (Header above):
   runs its body once per element of `values`, assigning each one, in
   turn, to a fresh `value` for that iteration.
5. `Console.WriteLine(value);` — an ordinary method call, printing
   whatever `value` currently holds, run three times total, once per
   iteration.

### CS Lens

`foreach` is **iteration**, one of the handful of truly fundamental
control-flow ideas in all of computing — doing the same thing, once per
element, for every element in a collection, regardless of how many there
turn out to be. Also recognized in: a factory assembly line performing the
same inspection step on every unit that passes by; a teacher grading every
paper in a stack, one at a time, using the same rubric each time; a mail
carrier delivering to every address on a route, in order; a spreadsheet
formula applied down an entire column, one row at a time.

### SE Lens

The alternative to `foreach` — an older-style loop with a manually tracked
index (`for (int i = 0; i < values.Length; i++) { var value = values[i];
... }`) — was available, and is not wrong; plenty of real C# code still
uses it, especially when the index itself is needed for something beyond
just walking the collection. `foreach` is chosen here because nothing in
this lesson's real logic needs the index at all — only each element's
value — and `foreach` removes an entire category of possible mistakes
(starting at the wrong number, stopping one iteration too early or late)
by never introducing an index in the first place. The cost: `foreach`
alone can't skip elements, go backwards, or change which element comes
next mid-loop the way an index-based loop can — none of which this
lesson's own logic needs.

### Commands Needed

None beyond this lesson's shared, end-of-lesson `dotnet build`.

### Run It

Predicted with full confidence, not executed standalone: both `List<T>.
Add` and `foreach` over an array are among the most basic, most
thoroughly documented constructs in C#, unchanged for the entire lifetime
of the language — this project's real, full build, covering this
lesson's actual, combined use of both, is shown at this lesson's end.

### Connecting Back

`DirectoryScanner` can now, in principle, walk every `FileInfo` `GetFiles`
returns and collect results into a real `List`. The next Concept Unit
combines this with the previous Concept Unit's array to make
`ScanDirectory` actually do that, for real.

---

## Concept Unit: Building the Result List

### The Problem

`ScanDirectory` (first Concept Unit) has a `FileInfo[]` and a declared
`List<InputFile>` return type, but nothing yet connects the two. This
unit's whole job is finishing the method: turning every `FileInfo` in the
array into an `InputFile`, collecting them, and returning the result.

> An earlier lesson converted one `FileInfo` into one `InputFile` with a
> single line: reading three properties and handing them, in order, to
> `InputFile`'s constructor. Inside a `foreach` loop over an array of
> `FileInfo`, would that exact same line of conversion code need to
> change at all — or does it stay identical, just now running once per
> element instead of once, total?

### Introduce the Concept in Isolation

No new isolated example — this unit combines three constructs already
fully proven: the `FileInfo`-to-`InputFile` conversion (an earlier
lesson), `List<T>.Add`, and `foreach` (both this lesson's previous
Concept Unit). Isolating that combination separately first would test
nothing not already known for certain.

### Discard the Throwaway Example

Not applicable — no new throwaway example was written for this unit.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — modified: `DirectoryScanner.cs`.
- **Change type** — add (the collecting loop and the method's return
  value).
- **Location** — inside `ScanDirectory`, after the `GetFiles` call from
  this lesson's first Concept Unit.
- **Dependencies** — this lesson's first Concept Unit's `directory` and
  `files` variables.

### The New Code

```csharp
var results = new List<InputFile>();

foreach (var file in files)
{
    results.Add(new InputFile(file.FullName, file.Name, file.LastWriteTime));
}

return results;
```

### The Updated Project

The full `DirectoryScanner.cs`, with the new lines marked:

```csharp
1  using System.IO;
2  
3  namespace MastercamGenerator;
4  
5  public class DirectoryScanner
6  {
7      public List<InputFile> ScanDirectory(string directoryPath)
8      {
9          var directory = new DirectoryInfo(directoryPath);
10         FileInfo[] files = directory.GetFiles("*.xml");
11 
12         var results = new List<InputFile>();                                    // ← new
13 
14         foreach (var file in files)                                             // ← new
15         {                                                                       // ← new
16             results.Add(new InputFile(file.FullName, file.Name, file.LastWriteTime));  // ← new
17         }                                                                       // ← new
18 
19         return results;                                                        // ← new
20     }
21 }
```

`ScanDirectory` now compiles and does everything this lesson has built so
far: given a real directory path, it returns a real `List<InputFile>`,
one entry per `.xml` file actually found.

### Mechanical Walkthrough

1. `var results = new List<InputFile>();` — **`var`** and **`List<T>`**
   (both Header above) again, this time with `InputFile` as the type
   argument — an empty list, ready to be filled.
2. `foreach (var file in files)` — a **`foreach` loop** (Header above)
   over `files`, the array from this lesson's first Concept Unit; `file`
   takes on each `FileInfo` in turn.
3. `results.Add(new InputFile(file.FullName, file.Name, file.
   LastWriteTime));` — inside the loop: `file.FullName`, `file.Name`, and
   `file.LastWriteTime` (all `FileInfo` properties, already fully
   explained in an earlier lesson) are read and handed, in order, to
   `InputFile`'s generated constructor (an earlier lesson's own subject);
   the resulting `InputFile` is immediately passed to **`List<T>.Add(T)`**
   (Header above), appending it to `results`. This is the identical
   conversion an earlier lesson proved for exactly one file, now running
   once per loop iteration instead of once, total.
4. `return results;` — a **`return` statement** (already fully explained
   in an earlier lesson), handing the completed list back to whatever
   called `ScanDirectory`.

### CS Lens

Building a new collection by transforming each element of an existing one
is the **map** operation — alongside **filter** (this lesson's first
Concept Unit), one of the two most common ways any program processes a
collection. `GetFiles("*.xml")` already filtered; this unit maps each
surviving `FileInfo` into an `InputFile`. Also recognized in: a currency
converter turning a list of dollar amounts into the equivalent list of
euro amounts, one for one; a photo app generating a thumbnail for every
full-size image in an album; a translation service converting every
sentence in a document into another language, one sentence at a time; a
spreadsheet column of Celsius values with a second column computing
Fahrenheit from each one, row by row.

### SE Lens

The alternative — modifying the original `FileInfo` array in place, or
returning `FileInfo[]` directly from `ScanDirectory` instead of converting
to `InputFile` at all — was available, and would have been less code
right here. It's not chosen because it would leak .NET's own filesystem
type out of `DirectoryScanner` and into every piece of code that ever
calls it, including, eventually, code that has no business knowing
`FileInfo` exists at all (a later stage of this curriculum's own test
suite, for instance, described in this project's own outline). Converting
at the boundary, once, here, means every caller of `ScanDirectory` only
ever has to know about this project's own `InputFile` — the same
Adapter idea an earlier lesson already established, now applied to many
files instead of one.

### Commands Needed

None beyond this lesson's shared, end-of-lesson `dotnet build`.

### Run It

Predicted with the same confidence already established for each of this
unit's individual pieces — this project's real, full build, covering this
exact method, is shown at this lesson's end.

### Connecting Back

`ScanDirectory` now does everything its signature promises, for a
directory that actually exists. What happens when it doesn't is this
lesson's next Concept Unit.

---

## Concept Unit: Handling a Missing Directory

### The Problem

`ScanDirectory`, as it stands, assumes the directory it's given actually
exists. In practice, it might not — a user could pick a folder through
`FileSource.SelectDirectory()`, and then, before this project ever gets
around to scanning it, that folder could be renamed, moved, or deleted
entirely (by some other program, or by the user themselves) — a real,
if rare, possibility this project's code currently has no way to survive.

> If `GetFiles` is called on a directory that no longer exists, what do
> you think happens — does it quietly return an empty array, as if the
> (nonexistent) directory simply had nothing in it, or does something more
> drastic happen? What would the difference mean for a caller that isn't
> prepared for it?

### Introduce the Concept in Isolation

Real, captured proof, from this lesson's own throwaway console project —
because exactly what happens here is not something to guess or paraphrase
from memory, per the Verification Rule's own treatment of error and
exception text:

```csharp
try
{
    var missing = new DirectoryInfo(@"C:\ThisDirectoryDefinitelyDoesNotExist_XYZ123");
    missing.GetFiles("*.xml");
}
catch (Exception ex)
{
    Console.WriteLine($"Exception type: {ex.GetType().FullName}");
    Console.WriteLine($"Message: {ex.Message}");
}
```

Real, captured output from running this exact code (.NET SDK 10.0.301)
against a path guaranteed not to exist:

```
Exception type: System.IO.DirectoryNotFoundException
Message: Could not find a part of the path 'C:\ThisDirectoryDefinitelyDoesNotExist_XYZ123'.
```

This proves `GetFiles` does not quietly return an empty array for a
missing directory — it throws a real, specifically-named exception,
`System.IO.DirectoryNotFoundException`, which, left unhandled, would crash
whatever program called it.

### Discard the Throwaway Example

The nonexistent path and the `catch (Exception ex)` block above exist only
in this lesson's own throwaway console project, deleted immediately after
this real output was captured — the real project (below) catches this
exact exception type by name, not the generic `Exception` used here purely
to observe what type it really was.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — modified: `DirectoryScanner.cs`.
- **Change type** — add (wrapping the existing scanning logic in a
  `try`/`catch`).
- **Location** — inside `ScanDirectory`, surrounding the code from this
  lesson's first three Concept Units.
- **Dependencies** — this lesson's already-complete `ScanDirectory` body.

### The New Code

```csharp
try
{
    var directory = new DirectoryInfo(directoryPath);
    FileInfo[] files = directory.GetFiles("*.xml");

    foreach (var file in files)
    {
        results.Add(new InputFile(file.FullName, file.Name, file.LastWriteTime));
    }
}
catch (DirectoryNotFoundException)
{
    return results;
}
```

### The Updated Project

The full `DirectoryScanner.cs`, with the `try`/`catch` and the reordered
`results` declaration marked:

```csharp
1  using System.IO;
2  
3  namespace MastercamGenerator;
4  
5  public class DirectoryScanner
6  {
7      public List<InputFile> ScanDirectory(string directoryPath)
8      {
9          var results = new List<InputFile>();                                        // ← moved earlier
10 
11         try                                                                          // ← new
12         {                                                                            // ← new
13             var directory = new DirectoryInfo(directoryPath);
14             FileInfo[] files = directory.GetFiles("*.xml");
15 
16             foreach (var file in files)
17             {
18                 results.Add(new InputFile(file.FullName, file.Name, file.LastWriteTime));
19             }
20         }                                                                            // ← new
21         catch (DirectoryNotFoundException)                                           // ← new
22         {                                                                            // ← new
23             return results;                                                          // ← new
24         }                                                                            // ← new
25 
26         return results;
27     }
28 }
```

`ScanDirectory` now survives its one anticipated failure: given a
directory that no longer exists, it returns an empty list instead of
letting `DirectoryNotFoundException` crash whatever called it. `results`
had to move earlier, before the `try` block, because both the `catch`
block and the method's final line need to refer to it — a variable
declared *inside* the `try` block would no longer exist once that block
ends, whether it finished normally or via an exception.

### Mechanical Walkthrough

1. `var results = new List<InputFile>();` — unchanged from this lesson's
   third Concept Unit, only relocated to before the `try` block, for the
   scoping reason stated above.
2. `try` — opens a **`try`/`catch`** (Header above) block: everything
   inside runs normally unless something throws.
3. `catch (DirectoryNotFoundException)` — names the one exception type
   this block watches for: **`System.IO.DirectoryNotFoundException`**
   (Header above), matched by its exact type — a different exception type
   thrown for a different reason would not be caught here, and would still
   crash the program, which is deliberate: this code claims to survive
   exactly one specific, anticipated failure, not every possible one.
4. `return results;` (inside `catch`) — a **`return` statement** (already
   fully explained in an earlier lesson), handing back whatever `results`
   held at the moment the exception was thrown — empty, in this specific
   failure case, since the exception fires before the `foreach` loop ever
   gets a chance to add anything.

### CS Lens

This is **exception handling** treating a specific, named failure as a
normal, anticipated outcome rather than a crash — the same idea an
earlier lesson's `bool?` return value used for "the user didn't pick a
folder," applied here to a different, more severe kind of failure that a
plain return value can't represent cleanly (an exception can occur
*partway through* a whole chain of operations, not just at the one point a
return value is checked). Also recognized in: a web browser showing a
"page not found" message instead of crashing when a server doesn't
respond; a vending machine returning coins instead of jamming when the
selected item is out of stock; a GPS app rerouting instead of freezing
when a road turns out to be closed; a payment system declining a card
gracefully instead of corrupting an order when a charge fails.

### SE Lens

The alternative — letting `DirectoryNotFoundException` propagate
uncaught, out of `ScanDirectory` and into whatever called it — was
available, and is sometimes the *right* choice: an exception that
propagates forces whoever's calling the code to notice and decide what to
do, rather than silently getting an empty (and, from the caller's
perspective, indistinguishable-from-a-real-empty-folder) result. Catching
it here, inside `DirectoryScanner` itself, and quietly returning an empty
list, is a real, debatable design decision: it makes `BrowseButton_Click`
simpler (nothing there has to know this specific failure exists at all),
at the real cost that a user whose folder vanished mid-scan sees "Files
Found: 0" — identical to what an honestly empty folder would show — with
no way to tell the two apart from the UI alone. This curriculum's own
outline names a dedicated error-handling system for later, precisely
because this exact tradeoff — catch quietly here, or let a caller decide —
recurs constantly and eventually needs a real, considered answer rather
than each individual method inventing its own.

### Commands Needed

- `dotnet new console -n ScratchDirectoryScanCheck` — scaffolds this
  unit's own throwaway proof (the same scratch project as this lesson's
  first Concept Unit, extended with the exception check above before
  being deleted).
- `dotnet run` — runs it, producing the real output quoted above.

### Run It

Shown above, in full, as real captured output — not predicted, since
exact exception types and messages are explicitly outside what this
curriculum's own schema treats as safe to state from memory.

### Connecting Back

`ScanDirectory` is now complete and safe to call with a folder that might,
in principle, no longer exist by the time it's scanned. The final Concept
Unit actually calls it from `MainWindow`, for the first time, replacing an
earlier lesson's explicitly-provisional stand-in.

---

## Concept Unit: Wiring the Scanner Into `MainWindow`

### The Problem

An earlier lesson's `MainWindow` constructor built exactly one `InputFile`
— from this running program's own executable, not from any folder a user
actually picked — and displayed it once, at startup, with no way to ever
change. That lesson explicitly flagged this as temporary. `DirectoryScanner`
now exists and can scan any real folder; nothing yet calls it from
`MainWindow` at all.

> `FileSource` is stored as a `readonly` field on `MainWindow`, constructed
> once, and called from inside `BrowseButton_Click`. Given `DirectoryScanner`
> is a plain class built the same way, with no state that needs to persist
> between calls, would the identical pattern — a `readonly` field,
> constructed once — make sense for it too? And once `BrowseButton_Click`
> has a real folder path in hand (already proven, from an earlier lesson,
> to only run past that point when the user genuinely confirmed one), what
> should happen to whatever the `ListBox` was already showing from the
> *previous* time someone clicked Browse?

### Introduce the Concept in Isolation

No new isolated example — every construct this unit combines
(`readonly` fields, calling a method on one, `foreach`, `List<T>`, string
interpolation, `ItemCollection.Add`) has already been fully proven,
individually, in this lesson or an earlier one. The one genuinely new
member, `ItemCollection.Clear()`, is a single, parameterless method with
one obvious, documented effect — real code, run for real as part of this
lesson's own final build, is proof enough without a separate isolated
version first.

### Discard the Throwaway Example

Not applicable — no new throwaway example was written for this unit.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — modified: `MainWindow.xaml` (a new `TextBlock` for
  the files-found count) and `MainWindow.xaml.cs` (a new field, a
  simplified constructor, and a rewritten `BrowseButton_Click`).
- **Change type** — add (the new field and `TextBlock`), remove (the
  constructor's earlier-lesson provisional code), and replace
  (`BrowseButton_Click`'s body).
- **Location** — `MainWindow.xaml`: inside the outer vertical
  `StackPanel`, between the folder row and the `ListBox`. `MainWindow.xaml
  .cs`: the field list, the constructor body, and all of
  `BrowseButton_Click`.
- **Dependencies** — this lesson's completed `DirectoryScanner`.

### The New Code

`MainWindow.xaml`'s new element:

```xml
<TextBlock x:Name="FilesFoundText" Text="Files Found: 0"/>
```

`MainWindow.xaml.cs`'s new field:

```csharp
private readonly DirectoryScanner _directoryScanner = new DirectoryScanner();
```

`BrowseButton_Click`'s new body:

```csharp
string? folder = _fileSource.SelectDirectory();
if (folder != null)
{
    FolderPathText.Text = folder;

    List<InputFile> discoveredFiles = _directoryScanner.ScanDirectory(folder);
    DiscoveredFilesListBox.Items.Clear();
    foreach (var file in discoveredFiles)
    {
        DiscoveredFilesListBox.Items.Add($"{file.FileName} — {file.LastModified}");
    }
    FilesFoundText.Text = $"Files Found: {discoveredFiles.Count}";
}
```

### The Updated Project

The full `MainWindow.xaml`, with the new element marked:

```xml
1  <Window x:Class="MastercamGenerator.MainWindow"
2          xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
3          xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
4          Title="Mastercam Generator" Height="450" Width="800">
5      <Grid>
6          <StackPanel Orientation="Vertical">
7              <StackPanel Orientation="Horizontal">
8                  <TextBlock Text="Folder: "/>
9                  <TextBlock x:Name="FolderPathText" Text="(none selected)"/>
10                 <Button Content="Browse" Click="BrowseButton_Click"/>
11             </StackPanel>
12             <TextBlock x:Name="FilesFoundText" Text="Files Found: 0"/>   // ← new
13             <ListBox x:Name="DiscoveredFilesListBox"/>
14         </StackPanel>
15     </Grid>
16 </Window>
```

The full `MainWindow.xaml.cs`, with every changed line marked:

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
17     private readonly DirectoryScanner _directoryScanner = new DirectoryScanner();   // ← new
18 
19     public MainWindow()
20     {
21         InitializeComponent();                                                      // ← earlier lesson's provisional code removed
22     }
23 
24     private void BrowseButton_Click(object sender, RoutedEventArgs e)
25     {
26         string? folder = _fileSource.SelectDirectory();
27         if (folder != null)
28         {
29             FolderPathText.Text = folder;
30 
31             List<InputFile> discoveredFiles = _directoryScanner.ScanDirectory(folder);   // ← new
32             DiscoveredFilesListBox.Items.Clear();                                        // ← new
33             foreach (var file in discoveredFiles)                                        // ← new
34             {                                                                            // ← new
35                 DiscoveredFilesListBox.Items.Add($"{file.FileName} — {file.LastModified}");  // ← new
36             }                                                                            // ← new
37             FilesFoundText.Text = $"Files Found: {discoveredFiles.Count}";                // ← new
38         }
39     }
40 }
```

`MainWindow`'s constructor is back to doing nothing beyond
`InitializeComponent()` — the earlier, explicitly-flagged shortcut is
gone entirely. Every real file this project now shows comes from an
actual scan of an actual folder the user picked, every single time
`Browse` is clicked.

### Mechanical Walkthrough

1. `<TextBlock x:Name="FilesFoundText" Text="Files Found: 0"/>` (XAML) —
   a **`TextBlock`** with an **`x:Name` directive** (both already fully
   explained in an earlier lesson), starting with placeholder text this
   lesson's own code overwrites the first time a folder is scanned.
2. `private readonly DirectoryScanner _directoryScanner = new
   DirectoryScanner();` (C#) — the identical field pattern already
   established for `_fileSource`: an **access modifier**, the **`readonly`
   modifier**, and a field initializer (all already fully explained in an
   earlier lesson), this time holding this lesson's own `DirectoryScanner`.
3. `List<InputFile> discoveredFiles = _directoryScanner.ScanDirectory
   (folder);` (C#) — calls this lesson's own **`DirectoryScanner.
   ScanDirectory(string)`** (Header above) through the field just added,
   passing in `folder` — already proven, by an earlier lesson's own `if
   (folder != null)` check, to be a real, non-null string at this exact
   point.
4. `DiscoveredFilesListBox.Items.Clear();` (C#) — reads `Items` (an
   earlier lesson's own subject) and calls **`ItemCollection.Clear()`**
   (Header above) on it, removing whatever an earlier scan may have left
   behind.
5. `foreach (var file in discoveredFiles)` (C#) — a **`foreach` loop**
   (Header above) over the list `ScanDirectory` returned.
6. `DiscoveredFilesListBox.Items.Add($"{file.FileName} — {file.
   LastModified}");` (C#) — inside the loop: reads `Items` again and calls
   `ItemCollection.Add(object)` (an earlier lesson's own subject), passing
   a **string interpolation** (already fully explained in an earlier
   lesson) built from this lesson's own `InputFile`'s `FileName` and
   `LastModified` properties.
7. `FilesFoundText.Text = $"Files Found: {discoveredFiles.Count}";` (C#) —
   `TextBlock.Text` (already fully explained in an earlier lesson) is set
   from another string interpolation, reading `discoveredFiles.Count` — a
   property `List<T>` provides reporting how many elements it currently
   holds, read here for the first time in this project.

### CS Lens

Removing the earlier lesson's provisional constructor code, now that a
real replacement exists, is **paying down technical debt** — a real,
named idea in software engineering: a deliberate shortcut, taken and
explicitly documented at the time, that a team commits to actually going
back and fixing once the real capability exists, rather than letting it
quietly become permanent. The value of having flagged it honestly, back
when it was written, shows up exactly here: nothing about removing it
required rediscovering that it was ever provisional in the first place.
Also recognized in: a construction crew using a temporary support beam
while building a permanent one, and actually removing the temporary one
once the real structure can bear the load; a business using a manual
spreadsheet process "just for now" while a real system is built, and
actually retiring the spreadsheet once that system ships; a city's
temporary traffic detour during roadwork, removed once the real road
reopens.

### SE Lens

Keeping `discoveredFiles.Count` (a `List<T>` property, read here for the
first time) rather than tracking a separately-maintained counter variable
incremented once per loop iteration was a real, deliberate choice: a
separate counter can drift out of sync with the list it's supposedly
counting if a future edit adds an item without also remembering to
increment it; reading the list's own `Count` can never be wrong, because
it isn't a second, independently-maintained fact about the same
information — it's the same fact, asked for directly, every time. The
cost paid for the earlier, provisional approach's removal: this
lesson deletes real code that worked and had already been verified, which
can feel wasteful in the moment — the alternative, though, is worse: an
honest, working shortcut, quietly left in a project forever because
removing it never felt urgent enough, is exactly how permanent workarounds
accumulate in real systems.

### Commands Needed

None beyond this lesson's one shared `dotnet build`, run once, covering
every Concept Unit's changes together — shown next.

### Run It

Real, captured output from running `dotnet build` against this lesson's
complete, final `DirectoryScanner.cs`, `MainWindow.xaml`, and
`MainWindow.xaml.cs` (.NET SDK 10.0.301), unedited:

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
new `DirectoryScanner` class, its filtering, mapping, and exception
handling, and this unit's own rewritten `MainWindow` wiring all compiled
together, in a single pass, per this curriculum's own batching practice.

### Connecting Back

Every earlier Concept Unit in this lesson built one piece of a chain this
unit finally puts in front of a real user: filtering (first unit) found
the right files; collecting (second and third units) turned them into
this project's own data; surviving failure (fourth unit) made that safe to
call on a folder that might not cooperate. This unit is what actually
calls all of it, for real, replacing a shortcut an earlier lesson took
knowingly and named honestly.

---

## Connect the Pieces

Trace one real click of "Browse," selecting a real folder with real XML
files in it, through every piece this lesson built:

1. `BrowseButton_Click` runs. `_fileSource.SelectDirectory()` (an earlier
   lesson's own subject) returns a real, confirmed folder path; `folder !=
   null` is `true`, and `FolderPathText.Text` is updated, exactly as an
   earlier lesson already proved.
2. `_directoryScanner.ScanDirectory(folder)` (this lesson's fifth Concept
   Unit) is called for the first time with a real path a user actually
   picked.
3. Inside `ScanDirectory` (first, second, and third Concept Units): a
   `DirectoryInfo` is constructed from that path; `GetFiles("*.xml")`
   asks the real operating system which files match, filtering out
   anything that isn't XML; a `foreach` loop maps each surviving
   `FileInfo` into a real `InputFile`, collected into a `List`. Because
   the folder genuinely exists (the user just picked it), the fourth
   Concept Unit's `try`/`catch` never triggers — that path exists for a
   real but rarer case, not this one.
4. `ScanDirectory` returns the completed list. Back in `BrowseButton_Click`
   (fifth Concept Unit), `DiscoveredFilesListBox.Items.Clear()` removes
   whatever an earlier click may have left showing.
5. A second `foreach` loop walks the returned list, and for each
   `InputFile`, `Items.Add` puts one new row into the `ListBox` — a real
   file name and a real last-modified time, exactly as an earlier lesson
   proved for one file, now repeated for however many were actually
   found.
6. `FilesFoundText.Text` is set from `discoveredFiles.Count` — a real,
   accurate count, read directly from the same list just displayed, never
   tracked separately.

The window now shows exactly what this curriculum's own outline described
at the start of this lesson: a folder, a real files-found count, and a
real list of the XML files inside it — built entirely from this lesson's
own filtering, mapping, and error-handling, wired into the one button this
project has had since an early lesson, doing real, useful work with it for
the first time.
