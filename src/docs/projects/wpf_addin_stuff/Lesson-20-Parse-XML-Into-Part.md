# Lesson 20: The Adapter, Built for Real — Parsing XML Into `Part`

**What you will build.** A `SetupSheetParser` class with one real method,
`ParseFile`, that loads this project's own real sample setup sheet and
produces a genuinely filled-in `Part` — real `NcFile`s, real `Operation`s,
real `Tool`s, real `Assembly`s, five levels deep, built automatically
from the actual XML instead of by hand. What this lesson is actually
about goes past this one class: every piece this project needs already
exists — `XDocument`/`XElement` (Lessons 14-15), `SetupSheetQueries`
(Lesson 15), the complete domain model (Lessons 16-19) — and this lesson
is where they finally meet. This is the real architectural milestone this
curriculum's own outline names it: the exact moment this project stops
treating XML as something to explore and starts treating it as a source
of real application data, translated once, at one seam, into a shape the
rest of this project never has to know came from XML at all.

**What you need to know first.** Lesson 15 — `SetupSheetQueries`, reused
here as this lesson's own real, working dependency for the first time
since it was built standalone. Lesson 19 — the complete domain model
(`Part`, `NcFile`, `Operation`, `Tool`, `Assembly`), this lesson's own
real output shape. Lesson 7 — the Try-pattern, already fully explained
for `DateTime.TryParseExact`, reused here for a different type entirely.

**Terms used in this lesson.**

- **`??` (null-coalescing operator)** — a C# operator, written as `a ??
  b`, evaluating to `a` if `a` is not `null`, or to `b` otherwise — a
  direct, inline way of saying "use this value, or fall back to this
  other one if the first is missing." It exists because the pattern it
  replaces — checking a value against `null` with a full `if`/`else`
  (already fully explained, in an earlier lesson) just to pick between it
  and a default — is common enough, especially when reading data that
  might honestly be absent (a field a real XML document doesn't happen to
  contain), that a single operator earns its place over writing the same
  four-line shape repeatedly.

**Objects and methods used.**

- **`SetupSheetParser`**
  - *What it is:* this project's new class representing "something that
    can turn a real setup sheet XML file into a real, filled-in `Part`."
  - *Implementation:* `public class SetupSheetParser` in the
    `MastercamGenerator` namespace — no base class, the same plain-class
    shape every application-logic class in this project has used since
    an earlier lesson.
  - *Its use:* the real translation step this entire domain-model phase
    has been building toward — the one place in this project that ever
    needs to know a real setup sheet's own tag names.
  - *Type:* a public class, instantiated with `new SetupSheetParser()`.
  - *Responsibility:* loading a real XML file and producing a real,
    completely filled-in `Part` — and nothing about displaying, editing,
    or validating what it produces, all later lessons' own concerns.
  - *Depends on:* a real, well-formed setup sheet XML file at a given
    path; internally, an earlier lesson's own `SetupSheetQueries`.
  - *Connects to:* constructs one `SetupSheetQueries` internally; not yet
    called from anywhere else in this project.
  - *Shape:* an eleventh real dependency boundary in this project, and
    the specific one this entire curriculum phase-pairing (XML
    understanding, then domain modeling) has been building toward
    connecting.
- **`SetupSheetParser.ParseFile(string)`**
  - *What it is:* the one public method `SetupSheetParser` exposes.
  - *Implementation:* `public Part ParseFile(string filePath)` — loads
    the file and returns a complete, real `Part`.
  - *Its use:* the real entry point this lesson's own verification calls,
    and the one any future caller (a later lesson's own UI, eventually)
    will call too.
  - *Type:* a public instance method.
  - *Responsibility:* orchestrating the complete translation, end to
    end, from one real file path to one real, filled-in domain object.
  - *Depends on:* a real, loadable, well-formed XML file.
  - *Connects to:* calls `XDocument.Load` (already fully explained) once,
    then this lesson's own internal `SetupSheetQueries` calls, in a
    nested sequence matching the domain model's own real shape.
  - *Shape:* the one public entry point into this lesson's new class.
- **`SetupSheetQueries.GetOperationTool(XElement)`**
  - *What it is:* a new method, added to an earlier lesson's own
    `SetupSheetQueries`, returning the single `TOOL` element nested
    directly inside a given `OPERATION`.
  - *Implementation:* `public XElement? GetOperationTool(XElement
    operation) { return operation.Element("TOOL"); }` — a thin wrapper
    around `XElement.Element(string)` (already fully explained, in an
    earlier lesson, for reading root-level metadata), applied here to a
    different element and a different tag name.
  - *Its use:* the real mechanism this lesson's own parser uses to reach
    each operation's own tool, without repeating the literal string
    `"TOOL"` at the parser's own call site.
  - *Type:* a public instance method.
  - *Responsibility:* answering, for one specific operation, "which tool
    element, if any, does it directly contain."
  - *Depends on:* a real `XElement` representing one `OPERATION`.
  - *Connects to:* called from `SetupSheetParser.ParseFile`.
  - *Shape:* this lesson's one small addition to an already-existing,
    previously-standalone class — proof that a class built one lesson can
    grow, later, exactly as much as a genuinely new real need requires,
    and no more.
- **`int.TryParse(string?, out int)`**
  - *What it is:* the method that attempts to convert text into a real
    `int`, without throwing an exception if the text isn't a valid
    number.
  - *Implementation:* a `static` method on `int`, following the literal
    **Try-pattern** (already fully explained, in an earlier lesson, for
    `DateTime.TryParseExact`): returns `bool` (`true` if the conversion
    succeeded), and hands back the actual parsed number through an
    **`out` parameter** (already fully explained).
  - *Its use:* converting a real `OPERATION`'s or `TOOL`'s own `NUMBER`
    attribute — always text, as every XML attribute is — into the real
    `int` `Operation.SequenceNumber` and `Tool.Number` actually need.
  - *Type:* a `static` method.
  - *Responsibility:* checking whether a given string is a valid whole
    number and, if so, producing the real `int` it represents; if not,
    leaving the `out` parameter at its own default, `0`, and reporting
    failure rather than throwing.
  - *Depends on:* a string to attempt to convert.
  - *Connects to:* called twice in this lesson's own parser — once per
    `NUMBER` attribute it reads.
  - *Shape:* the exact same Try-pattern shape an earlier lesson already
    proved, for a completely different data type — real, concrete
    evidence that "returns `bool`, reports the real result through
    `out`" is a genuine, recurring .NET idiom, not a one-off shape unique
    to date parsing.

---

## Concept Unit: The `??` Operator and Parsing Root Metadata

### The Problem

`SetupSheetQueries.GetRootMetadata` (an earlier lesson) returns `string?`
— a real value, or `null`, if the requested field isn't present at all.
`Part.Description` and `Part.Customer` (an earlier lesson's own domain
model), by contrast, are plain, non-nullable `string`s, guaranteed by
their own auto-property initializers to never be `null`. Something has
to bridge that gap: what does `Part.Description` become when
`GetRootMetadata` genuinely finds nothing?

> An earlier lesson already handled a very similar situation with a full
> `if`/`else`: check whether a nullable value is `null`, and assign one
> of two different results depending on the answer. If that exact
> pattern — "use this value, or fall back to a default if it's missing"
> — turned out to be common enough to deserve its own single operator,
> what would the smallest possible way to write it look like?

### Introduce the Concept in Isolation

A tiny, uninvolved comparison, its behavior predictable with full
confidence — the `??` operator's own contract is a stable, thoroughly
documented C# language feature:

```csharp
string? maybeName = null;
string name = maybeName ?? "(unknown)";
```

`name` ends up holding `"(unknown)"` — `maybeName` was `null`, so the
right-hand side of `??` was used instead. Written the longer way, this is
exactly `string name = maybeName != null ? maybeName : "(unknown)";` (a
**ternary conditional operator**, not otherwise used in this lesson) or,
longer still, an ordinary `if`/`else` (already fully explained) — `??` is
simply the most direct way to write this one specific, extremely common
shape.

### Discard the Throwaway Example

`maybeName`/`name` don't appear in the real project — they exist only to
isolate `??` itself before this lesson's real code (below) uses it for a
real field instead of an imagined name. Discarded now.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — created: `SetupSheetParser.cs`, in the
  `MastercamGenerator/` project folder.
- **Change type** — add (a brand-new file).
- **Location** — n/a; the start of a new file.
- **Dependencies** — an earlier lesson's own `SetupSheetQueries` and
  `Part`.

### The New Code

```csharp
namespace MastercamGenerator;

public class SetupSheetParser
{
    private readonly SetupSheetQueries _queries = new SetupSheetQueries();

    public Part ParseFile(string filePath)
    {
        XDocument document = XDocument.Load(filePath);

        var part = new Part();
        part.Description = _queries.GetRootMetadata(document, "DESCRIPTION") ?? "";
        part.Customer = _queries.GetRootMetadata(document, "CUSTOMER") ?? "";

        return part;
    }
}
```

### The Updated Project

This *is* the whole new structure so far — this lesson's remaining
Concept Units add to this same method's body.

### Mechanical Walkthrough

1. `namespace MastercamGenerator;` and `public class SetupSheetParser` —
   the same **namespace** and **`class`** declaration pattern (both
   already fully explained) as every other application class in this
   project.
2. `private readonly SetupSheetQueries _queries = new
   SetupSheetQueries();` — the identical `readonly` field pattern
   (already fully explained) already established for every other
   application dependency in this project — this class's own first real
   use of an earlier lesson's own, previously-standalone class.
3. `public Part ParseFile(string filePath)` — a method declaration,
   returning `Part` (an earlier lesson's own domain object), taking one
   `string` parameter.
4. `XDocument document = XDocument.Load(filePath);` — calls `XDocument.
   Load(string)` (already fully explained), storing the result.
5. `var part = new Part();` — constructs a real `Part` (already fully
   explained) — every one of its properties already holds a real,
   non-null default value, thanks to an earlier lesson's own auto-
   property initializers.
6. `part.Description = _queries.GetRootMetadata(document, "DESCRIPTION")
   ?? "";` — calls `SetupSheetQueries.GetRootMetadata` (already fully
   explained), which may return `null`; the **`??` operator** (Header
   above) supplies `""` — the identical empty-string default `Part`'s
   own auto-property initializer already used — as the fallback,
   guaranteeing `part.Description` is assigned a real `string` either
   way.
7. `part.Customer = _queries.GetRootMetadata(document, "CUSTOMER") ??
   "";` — the identical pattern, one field over.
8. `return part;` — a **`return` statement** (already fully explained),
   handing back the partially-filled `Part`.

### CS Lens

`??` is a small, concrete instance of **defaulting** — providing a known-
safe fallback for an operation that might legitimately produce nothing,
so that everything *after* it can proceed without needing to handle the
missing case itself. This is the same underlying goal an earlier lesson's
own auto-property initializers already served, from a different
direction: there, a property guaranteed itself a real starting value; `??`
guarantees a real value at the exact moment one might otherwise be
missing, mid-expression. Also recognized in: a thermostat displaying "--"
instead of a blank screen when no sensor reading is currently available;
a form pre-filling a "Country" field with a sensible default rather than
leaving it blank; a phone app showing "Unknown Caller" instead of an
empty name field when no contact match is found.

### SE Lens

The alternative — an explicit `if (value == null) { part.Description =
""; } else { part.Description = value; }`, the full shape an earlier
lesson's own similar logic already used — was available, and reads more
explicitly, step by step. `??` is chosen instead because this exact
shape (nullable value in, guaranteed non-null value out, one specific
fallback) repeats identically for every one of this parser's own root
fields — writing the full `if`/`else` four times over would be pure
repetition of a pattern `??` states in one line, with nothing about the
longer form adding real clarity once the pattern itself is already
familiar.

### Commands Needed

None yet beyond this lesson's own final, real verification, shown in this
lesson's final Concept Unit.

### Run It

Predicted with full confidence for `??`'s own mechanics; this lesson's
real, complete, captured output — including these exact two fields — is
shown in full in this lesson's final Concept Unit.

### Connecting Back

`SetupSheetParser` can now produce a `Part` with two of its four fields
genuinely sourced from real XML. The next Concept Unit gives it real
`NcFile`s to go with them.

---

## Concept Unit: `foreach` Over Real Queries — Building `NcFile`s

### The Problem

`part.NcFiles` (an earlier lesson) is already a real, empty `List
<NcFile>` — but nothing yet fills it with real `NcFile`s built from the
document's own actual `NCFILE` elements.

### Introduce the Concept in Isolation

No new isolated example — looping over `SetupSheetQueries.FindNcFiles`'s
own already-proven result, building one domain object per real element
found, is the identical `foreach`-plus-construction pattern this
project's own earlier, hand-built examples (an earlier lesson's own
`Part`/`NcFile`/`Operation` graph, built entirely by hand) already
demonstrated — just driven by real data instead of literal values typed
directly into the code.

### Discard the Throwaway Example

Not applicable — no new throwaway example was written for this unit.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — modified: `SetupSheetParser.cs`.
- **Change type** — add (a `foreach` loop inside `ParseFile`).
- **Location** — inside `ParseFile`, after this lesson's previous
  Concept Unit's two field assignments.
- **Dependencies** — this lesson's previous Concept Unit's `part` and
  `document` variables.

### The New Code

```csharp
foreach (XElement ncFileElement in _queries.FindNcFiles(document))
{
    var ncFile = new NcFile();
    ncFile.ProgramName = _queries.GetNcFileName(ncFileElement) ?? "";

    part.NcFiles.Add(ncFile);
}
```

### The Updated Project

The full `SetupSheetParser.cs`, with the new lines marked:

```csharp
1  namespace MastercamGenerator;
2  
3  public class SetupSheetParser
4  {
5      private readonly SetupSheetQueries _queries = new SetupSheetQueries();
6  
7      public Part ParseFile(string filePath)
8      {
9          XDocument document = XDocument.Load(filePath);
10 
11         var part = new Part();
12         part.Description = _queries.GetRootMetadata(document, "DESCRIPTION") ?? "";
13         part.Customer = _queries.GetRootMetadata(document, "CUSTOMER") ?? "";
14 
15         foreach (XElement ncFileElement in _queries.FindNcFiles(document))  // ← new
16         {                                                                   // ← new
17             var ncFile = new NcFile();                                     // ← new
18             ncFile.ProgramName = _queries.GetNcFileName(ncFileElement) ?? "";  // ← new
19 
20             part.NcFiles.Add(ncFile);                                      // ← new
21         }                                                                   // ← new
22 
23         return part;
24     }
25 }
```

`ParseFile` now builds one real `NcFile` per real `NCFILE` element the
document actually contains, however many that turns out to be — this
lesson's own real sample file has two.

### Mechanical Walkthrough

1. `foreach (XElement ncFileElement in _queries.FindNcFiles(document))`
   — a **`foreach` loop** (already fully explained) over `SetupSheetQueries.
   FindNcFiles`'s (an earlier lesson's own subject) real result — one
   iteration per real `NCFILE` element in the document, whatever that
   number turns out to be.
2. `var ncFile = new NcFile();` — constructs a real `NcFile` (an earlier
   lesson's own domain object) for this one iteration.
3. `ncFile.ProgramName = _queries.GetNcFileName(ncFileElement) ?? "";` —
   calls `SetupSheetQueries.GetNcFileName` (already fully explained),
   with the identical **`??`** fallback (Header above) already
   established for `part.Description`/`part.Customer`.
4. `part.NcFiles.Add(ncFile);` — appends the newly-built `NcFile` to
   `part`'s own collection, using `List<T>.Add` (already fully
   explained).

### CS Lens

This is the real, working version of the same **map** operation an
earlier lesson already named for `DirectoryScanner`: transforming each
element of one sequence (`XElement`s, from `FindNcFiles`) into a
corresponding element of a different kind (`NcFile`s), one for one, in
order. There, the transformation turned a `FileInfo` into an `InputFile`;
here, the identical idea turns an `XElement` into an `NcFile` — the same
underlying computational shape, applied to genuinely different data.

### SE Lens

The alternative — computing `part.NcFiles.Count` after the fact, from
whatever `FindNcFiles` happens to return, rather than counting iterations
as the loop runs — isn't actually a choice this code makes at all: the
loop's own structure guarantees exactly one `NcFile` is added per real
`NCFILE` element, with no separate counting step needed anywhere. This is
worth noting specifically because it's the same principle an earlier
lesson's own SE Lens already argued for directly: read a real, derived
fact (`part.NcFiles.Count`) from the data structure that actually holds
it, rather than maintaining a separate, parallel count that could drift
out of sync.

### Commands Needed

None yet beyond this lesson's own final, real verification.

### Run It

Predicted with full confidence for this loop's own mechanics; this
lesson's real, complete, captured output is shown in full in this
lesson's final Concept Unit.

### Connecting Back

`ParseFile` now produces real `NcFile`s, one per real element. Neither
one has any `Operation`s in it yet — that's this lesson's next Concept
Unit.

---

## Concept Unit: Converting Text to a Number — `int.TryParse`

### The Problem

A real `OPERATION` element's `NUMBER` attribute — like every XML
attribute — is always text, even when it visually looks like a number:
`"10"`, not `10`. `Operation.SequenceNumber` (an earlier lesson) is a
real `int`. Something has to convert one into the other, safely, in case
a real file's `NUMBER` attribute is ever missing or malformed.

> If an `OPERATION`'s `NUMBER` attribute were missing entirely, or
> contained something that isn't a real number at all — a stray typo in
> a hand-edited file, say — should parsing the rest of that operation's
> own data crash outright, or is there a more forgiving way to handle
> just that one, specific piece of it?

### Introduce the Concept in Isolation

A tiny, uninvolved conversion, its behavior predictable with full
confidence — `int.TryParse`'s own Try-pattern contract is identical, in
shape, to an earlier lesson's own already-proven `DateTime.TryParseExact`:

```csharp
bool succeeded = int.TryParse("10", out int result);
```

`succeeded` is `true`, and `result` holds `10` — a real `int`, converted
from the text `"10"`. Given `int.TryParse("abc", out int failed)`
instead, `succeeded` would be `false`, and `failed` would be left at its
own default, `0`, rather than throwing.

### Discard the Throwaway Example

`succeeded`/`result` don't appear in the real project — they exist only
to isolate `int.TryParse`'s own contract before this lesson's real code
(below) applies it to a real attribute's text instead of a literal
string. Discarded now.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — modified: `SetupSheetParser.cs`.
- **Change type** — add (a nested `foreach` loop, inside the existing
  one, building real `Operation`s).
- **Location** — inside the `foreach` loop from this lesson's previous
  Concept Unit, after `ncFile.ProgramName` is assigned.
- **Dependencies** — this lesson's previous Concept Unit's `ncFile`
  variable.

### The New Code

```csharp
foreach (XElement operationElement in _queries.FindOperations(ncFileElement))
{
    var operation = new Operation();

    string? numberText = operationElement.Attribute("NUMBER")?.Value;
    int.TryParse(numberText, out int sequenceNumber);
    operation.SequenceNumber = sequenceNumber;

    operation.Description = operationElement.Element("DESCRIPTION")?.Value ?? "";

    ncFile.Operations.Add(operation);
}
```

### The Updated Project

The full `SetupSheetParser.cs`, with the new lines marked:

```csharp
1  namespace MastercamGenerator;
2  
3  public class SetupSheetParser
4  {
5      private readonly SetupSheetQueries _queries = new SetupSheetQueries();
6  
7      public Part ParseFile(string filePath)
8      {
9          XDocument document = XDocument.Load(filePath);
10 
11         var part = new Part();
12         part.Description = _queries.GetRootMetadata(document, "DESCRIPTION") ?? "";
13         part.Customer = _queries.GetRootMetadata(document, "CUSTOMER") ?? "";
14 
15         foreach (XElement ncFileElement in _queries.FindNcFiles(document))
16         {
17             var ncFile = new NcFile();
18             ncFile.ProgramName = _queries.GetNcFileName(ncFileElement) ?? "";
19 
20             foreach (XElement operationElement in _queries.FindOperations(ncFileElement))  // ← new
21             {                                                                              // ← new
22                 var operation = new Operation();                                           // ← new
23 
24                 string? numberText = operationElement.Attribute("NUMBER")?.Value;           // ← new
25                 int.TryParse(numberText, out int sequenceNumber);                           // ← new
26                 operation.SequenceNumber = sequenceNumber;                                  // ← new
27 
28                 operation.Description = operationElement.Element("DESCRIPTION")?.Value ?? "";  // ← new
29 
30                 ncFile.Operations.Add(operation);                                           // ← new
31             }                                                                              // ← new
32 
33             part.NcFiles.Add(ncFile);
34         }
35 
36         return part;
37     }
38 }
```

`ParseFile` now builds one real `Operation` per real `OPERATION` element
inside each `NcFile`, with a real, correctly-converted `SequenceNumber`
and `Description` — `Operation.Tool` still holds only its own default,
empty `Tool`, addressed next.

### Mechanical Walkthrough

1. `foreach (XElement operationElement in _queries.FindOperations
   (ncFileElement))` — a **`foreach` loop** (already fully explained)
   over `SetupSheetQueries.FindOperations` (already fully explained),
   nested inside the outer loop from this lesson's previous Concept Unit
   — one iteration per real `OPERATION` inside this specific `NCFILE`.
2. `string? numberText = operationElement.Attribute("NUMBER")?.Value;` —
   reads `XElement.Attribute(string)` (already fully explained), guarded
   by the **null-conditional operator** `?.` (already fully explained),
   storing the result — a `string?` — since the attribute might not
   exist at all.
3. `int.TryParse(numberText, out int sequenceNumber);` — calls
   **`int.TryParse(string?, out int)`** (Header above): `numberText`
   (possibly `null`) is the text to attempt converting; `out int
   sequenceNumber` declares a brand-new variable, right at the call site,
   as an **`out` parameter** (already fully explained) — `TryParse`
   itself assigns it before this line finishes, `0` if conversion fails,
   the real converted number if it succeeds. This lesson's own code
   doesn't check the returned `bool` at all — leaving `sequenceNumber` at
   `0` for a genuinely malformed or missing attribute is treated as an
   acceptable, honest default here, not a case requiring special
   handling.
4. `operation.SequenceNumber = sequenceNumber;` — assigns the real,
   converted value.
5. `operation.Description = operationElement.Element("DESCRIPTION")
   ?.Value ?? "";` — the identical `Element`/`?.`/`??` pattern (all
   Header above or already fully explained) already used for `Part`'s
   own fields, applied here to one operation's own description.
6. `ncFile.Operations.Add(operation);` — appends the new `Operation` to
   `ncFile`'s own collection, using `List<T>.Add` (already fully
   explained).

### CS Lens

Not checking `int.TryParse`'s own returned `bool` at all — accepting `0`
silently for anything that fails to convert — is a real, deliberate
choice about **failure tolerance**: some failures are worth stopping for;
others are more honestly treated as "we don't have real data here,"
recorded as an honest zero rather than crashing the entire parse over one
malformed attribute in one operation, out of potentially many. This
mirrors an earlier lesson's own `DirectoryScanner`, which caught a
missing-directory exception and returned an empty result rather than
propagating the failure — a real, recurring pattern in this project: fail
narrowly, locally, and keep going, rather than letting one bad piece of
input take down an entire operation that doesn't strictly depend on it.

### SE Lens

The alternative — checking `TryParse`'s own `bool` result, and doing
something more deliberate on failure (skipping the operation entirely,
logging a warning, throwing) — was available, and might well be the
right choice for a production version of this exact parser. It's not
chosen here because this project doesn't have a real logging or error-
reporting mechanism yet (a later lesson's own responsibility, per this
curriculum's own outline naming a dedicated error-handling phase) — silently
defaulting to `0` for now is an honest, minimal placeholder, not a
permanent design decision, and revisiting it once real error handling
exists is exactly the kind of deliberate future work this project's own
domain model was built to support without needing to be restructured.

### Commands Needed

None yet beyond this lesson's own final, real verification.

### Run It

Predicted with full confidence for `int.TryParse`'s own mechanics,
already proven, in identical shape, for a different type, in an earlier
lesson; this lesson's real, complete, captured output is shown in full in
this lesson's final Concept Unit.

### Connecting Back

`ParseFile` now produces real `Operation`s with real numbers and
descriptions. Each one's own `Tool` still holds nothing but its own
default. The final Concept Unit reaches those last two levels.

---

## Concept Unit: Reaching Two Levels Deeper — Parsing `Tool` and `Assembly`

### The Problem

`Operation.Tool` (an earlier lesson) already exists, guaranteed non-null
by its own auto-property initializer — but nothing yet fills it with a
real tool's own number, description, or holder, even though the real XML
nests exactly that information directly inside each `OPERATION`.

### Introduce the Concept in Isolation

No new isolated example — this unit combines constructs already fully
proven, earlier in this same lesson (`Element`, `?.`, `??`, `int.
TryParse`) with one new, small addition to `SetupSheetQueries` — not a
new syntax construct requiring its own isolated lab.

### Discard the Throwaway Example

Not applicable — no new throwaway example was written for this unit.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — modified: `SetupSheetQueries.cs` (one new method)
  and `SetupSheetParser.cs` (the final piece of `ParseFile`'s own body).
- **Change type** — add, both files.
- **Location** — `SetupSheetQueries.cs`: alongside its existing methods.
  `SetupSheetParser.cs`: inside the inner `foreach` loop from this
  lesson's previous Concept Unit, after `operation.Description` is
  assigned.
- **Dependencies** — this lesson's previous Concept Unit's `operation`
  and `operationElement` variables.

### The New Code

`SetupSheetQueries.cs`'s new method:

```csharp
public XElement? GetOperationTool(XElement operation)
{
    return operation.Element("TOOL");
}
```

`SetupSheetParser.cs`'s new lines:

```csharp
XElement? toolElement = _queries.GetOperationTool(operationElement);
if (toolElement != null)
{
    string? toolNumberText = toolElement.Attribute("NUMBER")?.Value;
    int.TryParse(toolNumberText, out int toolNumber);
    operation.Tool.Number = toolNumber;
    operation.Tool.Description = toolElement.Element("DESCRIPTION")?.Value ?? "";
    operation.Tool.Assembly.Holder = toolElement.Element("ASSEMBLY")?.Element("HOLDER")?.Value ?? "";
}
```

### The Updated Project

The full `SetupSheetParser.cs`, as it stands at the end of this lesson,
with the new lines marked:

```csharp
1  using System.Xml.Linq;
2  
3  namespace MastercamGenerator;
4  
5  public class SetupSheetParser
6  {
7      private readonly SetupSheetQueries _queries = new SetupSheetQueries();
8  
9      public Part ParseFile(string filePath)
10     {
11         XDocument document = XDocument.Load(filePath);
12 
13         var part = new Part();
14         part.Description = _queries.GetRootMetadata(document, "DESCRIPTION") ?? "";
15         part.Customer = _queries.GetRootMetadata(document, "CUSTOMER") ?? "";
16 
17         foreach (XElement ncFileElement in _queries.FindNcFiles(document))
18         {
19             var ncFile = new NcFile();
20             ncFile.ProgramName = _queries.GetNcFileName(ncFileElement) ?? "";
21 
22             foreach (XElement operationElement in _queries.FindOperations(ncFileElement))
23             {
24                 var operation = new Operation();
25 
26                 string? numberText = operationElement.Attribute("NUMBER")?.Value;
27                 int.TryParse(numberText, out int sequenceNumber);
28                 operation.SequenceNumber = sequenceNumber;
29 
30                 operation.Description = operationElement.Element("DESCRIPTION")?.Value ?? "";
31 
32                 XElement? toolElement = _queries.GetOperationTool(operationElement);  // ← new
33                 if (toolElement != null)                                             // ← new
34                 {                                                                    // ← new
35                     string? toolNumberText = toolElement.Attribute("NUMBER")?.Value;   // ← new
36                     int.TryParse(toolNumberText, out int toolNumber);                  // ← new
37                     operation.Tool.Number = toolNumber;                                // ← new
38                     operation.Tool.Description = toolElement.Element("DESCRIPTION")?.Value ?? "";  // ← new
39                     operation.Tool.Assembly.Holder = toolElement.Element("ASSEMBLY")?.Element("HOLDER")?.Value ?? "";  // ← new
40                 }                                                                    // ← new
41 
42                 ncFile.Operations.Add(operation);
43             }
44 
45             part.NcFiles.Add(ncFile);
46         }
47 
48         return part;
49     }
50 }
```

`ParseFile` is now complete — every level of this project's own domain
model, from `Part` down to `Assembly`, is genuinely filled in from real
XML.

### Mechanical Walkthrough

1. `XElement? toolElement = _queries.GetOperationTool(operationElement);`
   — calls **`SetupSheetQueries.GetOperationTool(XElement)`** (Header
   above), storing its possibly-`null` result.
2. `if (toolElement != null)` — a guard clause (already fully explained):
   the rest of this block only runs if this specific operation actually
   has a nested `TOOL` element at all.
3. `string? toolNumberText = toolElement.Attribute("NUMBER")?.Value;` and
   `int.TryParse(toolNumberText, out int toolNumber); operation.Tool.
   Number = toolNumber;` — the identical `Attribute`/`?.`/`TryParse`/`out`
   pattern already proven, earlier in this lesson, for `Operation.
   SequenceNumber`, applied here to `Tool.Number` instead.
4. `operation.Tool.Description = toolElement.Element("DESCRIPTION")
   ?.Value ?? "";` — the identical `Element`/`?.`/`??` pattern already
   proven for `Operation.Description`, one level deeper.
5. `operation.Tool.Assembly.Holder = toolElement.Element("ASSEMBLY")
   ?.Element("HOLDER")?.Value ?? "";` — a **chained** null-conditional
   read: `toolElement.Element("ASSEMBLY")` might itself be `null` (a real
   tool in this lesson's own sample file genuinely has no `ASSEMBLY` at
   all); the first `?.` guards against calling `.Element("HOLDER")` on a
   `null` result; the second `?.` guards the final `.Value` read the
   identical way; `??` supplies `""` if any link in that chain came back
   `null`. `operation.Tool.Assembly` itself is never `null` — this
   lesson's own domain model already guarantees that — only the *real
   XML data* reaching that far down might genuinely be missing.

### CS Lens

A chain of `?.` calls, several links long, is **null propagation** — a
real, deliberate technique for reaching several levels into a possibly-
incomplete structure, where *any* link along the way might be absent,
without a separate, explicit null check at every single step. Real,
verified proof that this genuinely matters here — not just a
theoretical concern — comes from this lesson's own final Concept Unit's
real output: one of this project's own real sample file's own `TOOL`
elements genuinely has no `ASSEMBLY` at all, and this exact chain
handles it correctly, falling through to `""` rather than throwing.
Also recognized in: a shipping app checking `order?.Recipient?.Address?.
PostalCode`, where any one of an order, its recipient, or their address
might genuinely be missing; a config reader checking `settings?.
Database?.ConnectionString`, tolerating an entire missing section rather
than requiring every level to be explicitly checked first.

### SE Lens

The alternative — nested `if` statements checking `toolElement.Element
("ASSEMBLY")` for `null` explicitly, before ever attempting to read
`HOLDER` — was available, and is exactly what this exact line would have
required before C# added the `?.` operator. It's not chosen because it
would mean one full `if` block per level of nesting, for a chain that, in
this lesson's own domain model, is only ever read for its final value —
never for "did we get partway down before failing," a distinction the
chained `?.` form doesn't preserve and this lesson's own code has no use
for anyway.

### Commands Needed

None yet beyond this lesson's own final, real verification, shown next.

### Run It

Predicted with full confidence for the mechanics of chaining
already-proven operators together; this lesson's real, complete,
captured output — including the real, missing-`ASSEMBLY` case — is shown
in full in the next, final Concept Unit.

### Connecting Back

`SetupSheetParser` is now complete: every level of this project's own
domain model, from `Part` down to `Assembly`, is filled in from real,
actual XML, not by hand. The final Concept Unit proves it, for real,
against this project's own real sample file.

---

## Concept Unit: Running the Real Parser Against the Real File

### The Problem

`SetupSheetParser` compiles and reads correctly — but per this
curriculum's own schema, that's not proof. Whether it correctly produces
a `Part` matching this project's own real sample file — including its
two `NcFile`s, its placeholder-valued root metadata, and its one `TOOL`
with no `ASSEMBLY` at all — needs to be shown, not assumed.

### Introduce the Concept in Isolation

No new isolated example — this unit's whole point is running the real,
complete `SetupSheetParser` against the real, complete sample file,
exactly as it will actually be used.

### Discard the Throwaway Example

Not applicable — this unit verifies the real project's own code and data
directly.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — none; this unit verifies `SetupSheetParser.cs`,
  `SetupSheetQueries.cs`, the complete domain model, and the real sample
  file exactly as they already stand.
- **Change type** — n/a.
- **Location** — n/a.
- **Dependencies** — this lesson's complete `SetupSheetParser` and every
  domain-model and query class this curriculum has built so far.

### Commands Needed

- `dotnet new console -n Lesson20ParserCheck` — scaffolds this unit's own
  verification project, saved permanently in this curriculum's own
  `verification/lesson-20/` folder (not deleted afterward, per this
  curriculum's own corrected verification workflow) — containing real
  copies of the complete domain model, `SetupSheetQueries`, and
  `SetupSheetParser`, run directly against the real sample file's real
  path.
- `dotnet run` — runs it, producing the real output below.

### Run It

Real, captured output from running the complete, real parser against the
real, complete `SetupSheet_2026-08-26_0512.xml` (.NET SDK 10.0.301):

```
Part.Description: "PART NAME"
Part.Customer: "REV"
Part.PartNumber (no source in this file): ""
NcFiles.Count: 2
  NcFile "SetupSheet_2026-08-26_0512", Operations.Count: 2
    Operation 10: "Face Mill Top", Tool #1 "3 Inch Face Mill", Holder: "CAT40 Face Mill Holder"
    Operation 20: "Drill Holes", Tool #5 "Half Inch Drill", Holder: "CAT40 Drill Chuck"
  NcFile "SetupSheet_2026-08-20_0900", Operations.Count: 1
    Operation 10: "Rough Mill", Tool #1 "3 Inch Face Mill", Holder: ""
```

This proves, for real, every claim this lesson has made: `Part.
Description` and `Part.Customer` genuinely hold the real file's own
placeholder values, `"PART NAME"` and `"REV"` — the parser faithfully
reproduces exactly what the document actually says, placeholders and
all, which is precisely why a later lesson's own real validation logic
will need to exist, rather than this parser silently "fixing" them.
`Part.PartNumber` genuinely stays empty, honestly, since this real file
has no matching element for it at all. Both real `NcFile`s are found,
each with the correct number of real `Operation`s, each correctly
numbered and described. Every `Tool` is correctly filled in, including
the one real case — the second `NcFile`'s own operation — where the real
XML has no `ASSEMBLY` element at all, correctly producing an empty
`Holder` rather than a crash.

### Connecting Back

Every earlier Concept Unit in this lesson built one piece of a chain this
unit finally confirms works, completely, against real data: root
metadata (first unit), a real collection of `NcFile`s (second unit),
real `Operation`s with real converted numbers (third unit), and real,
safely-chained `Tool`/`Assembly` data (fourth unit) — all proven, here,
to genuinely work together on this project's own real file, not just
individually.

---

## Connect the Pieces

Trace this project's real sample file, start to finish, through this
lesson's complete, real parser:

1. `ParseFile` loads the real file via `XDocument.Load` (first Concept
   Unit), and reads `DESCRIPTION`/`CUSTOMER` directly from the root,
   producing `Part.Description = "PART NAME"` and `Part.Customer =
   "REV"` — real, verified, placeholder-and-all.
2. A `foreach` loop (second Concept Unit) walks both real `NCFILE`
   elements, building one real `NcFile` per element, each with its own
   real `ProgramName`.
3. A nested `foreach` loop (third Concept Unit) walks each `NcFile`'s own
   real `OPERATION` elements, building real `Operation`s with real,
   `int.TryParse`-converted `SequenceNumber`s and real `Description`s.
4. For each operation, a real `TOOL` element, if present, is found
   (fourth Concept Unit), and its own number, description, and — reaching
   through a real, chained, null-safe path — its holder, are all read
   into `operation.Tool` and `operation.Tool.Assembly`.
5. This lesson's own final Concept Unit ran this exact chain for real,
   against this project's own real file, and captured real, correct
   output at every single level — five real domain objects deep, built
   entirely automatically from actual XML.

This is the real architectural milestone this curriculum's own outline
named at the start of this lesson: XML, application logic, and a typed
domain model, meeting at exactly one seam, for the first time. Nothing
outside `SetupSheetParser` itself will ever need to know a real setup
sheet's own tag names again — every future lesson that touches this
data (validation, display, export) works entirely in terms of `Part`,
`NcFile`, `Operation`, `Tool`, and `Assembly`, exactly as an earlier
lesson's own Adapter reasoning promised it would.
