# Lesson 14: A Method That Calls Itself — Exploring the Real XML

**What you will build.** A real sample setup-sheet XML file — this
curriculum's first, since none existed anywhere in this project until
now — and an `XmlExplorer` class that loads it and prints its entire
structure as an indented tree, one line per element, showing every
attribute along the way. What this lesson is actually about goes past
this one small tool: every file this project has read so far (a `.xml`
file's name, its timestamp) has been treated as an opaque unit — a whole
thing, never opened and looked inside. This is the first lesson that
actually opens a real XML file's contents and looks at its real shape:
nested elements, repeated siblings, and a document-shaped tree with
branches at every level rather than the flat lists and single values this
project has worked with until now. It is also the first time this
project needs a method to call *itself* — an ordinary, deliberate
technique, not a bug, for a document whose real depth (how many levels of
`OPERATION`s inside `NCFILE`s, `TOOL`s inside `OPERATION`s) isn't known in
advance and can't be hard-coded.

**What you need to know first.** Lesson 1 — **XML element** and **XML
attribute**, first explained there for XAML specifically (XAML, this
lesson's own opening paragraph in that earlier lesson already noted, is
itself XML) — this lesson works with .NET's own object representation of
those same two ideas, for a document with no connection to WPF at all.
Lesson 7 — this project's own `<Name>_yyyy-MM-dd_HHmm.xml` naming
convention, reused for this lesson's new sample file's own name.

**Terms used in this lesson.**

- **recursion** — a technique where a method calls itself, directly or
  indirectly, in order to solve a problem by breaking it into a smaller
  version of the identical problem. Each call works on a smaller piece of
  the original input (here, one level deeper into the document) until it
  reaches a piece simple enough to finish without calling itself again
  (here, an element with no children at all, where the recursive call
  loop simply never runs). It exists because some real data is naturally
  shaped like a tree with unknown depth — this lesson's own XML document
  might nest three levels deep in one place and one level deep in
  another — and a fixed number of nested loops, one per level, could
  never be written in advance for a depth that isn't known until the
  actual document is read.

**Objects and methods used.**

- **`XmlExplorer`**
  - *What it is:* this project's new class representing "something that
    can load a real XML file and describe its entire structure as
    readable text."
  - *Implementation:* `public class XmlExplorer` in the
    `MastercamGenerator` namespace — no base class, the same plain-class
    shape every application-logic class in this project has used since
    an earlier lesson.
  - *Its use:* a standalone tool, this lesson, for actually seeing what a
    real setup-sheet XML document looks like from the inside — not yet
    connected to any real parsing logic, which this curriculum's own
    outline reserves for a later phase.
  - *Type:* a public class, instantiated with `new`.
  - *Responsibility:* turning a real XML file into a readable, indented
    description of every element it contains, at every depth.
  - *Depends on:* a real, valid XML file path.
  - *Connects to:* not yet called from anywhere else in this project —
    this lesson's own verification is its only real caller so far.
  - *Shape:* an eighth real dependency boundary in this project — a tool
    for *understanding* data, deliberately kept separate from any future
    class that will actually *use* it.
- **`XmlExplorer.DescribeTree(string)`**
  - *What it is:* the one public method `XmlExplorer` exposes.
  - *Implementation:* `public string DescribeTree(string filePath)` —
    loads the file and returns its entire structure as one large,
    multi-line string.
  - *Its use:* the real entry point this lesson's own verification calls.
  - *Type:* a public instance method.
  - *Responsibility:* loading a real file and kicking off this lesson's
    recursive description, starting from the document's own root
    element.
  - *Depends on:* a real, loadable XML file.
  - *Connects to:* calls `XDocument.Load` (below) once, then this
    lesson's own private, recursive `DescribeElement` (below).
  - *Shape:* the one public entry point into this lesson's new class.
- **`XmlExplorer.DescribeElement(XElement, int)`** *(private)*
  - *What it is:* the private, recursive method that actually walks the
    document, one element at a time.
  - *Implementation:* `private string DescribeElement(XElement element,
    int depth)` — an **access modifier** (already fully explained) of
    `private`, the same reason an earlier lesson's own `FileReadyWaiter.
    IsFileReady` was kept private: this is an internal mechanism, not
    part of this class's real, public promise.
  - *Its use:* called once for the document's root element, and then
    again, by itself, once per child element, however many levels deep
    the real document actually goes.
  - *Type:* a private instance method.
  - *Responsibility:* describing exactly one element — its name, its
    attributes — and then describing every one of its own children the
    identical way, at one greater depth.
  - *Depends on:* a real `XElement` to describe, and the current depth,
    used purely to control indentation.
  - *Connects to:* calls itself, once per child element found via
    `XElement.Elements()` (below).
  - *Shape:* the actual recursive mechanism this entire lesson exists to
    introduce.
- **`System.Xml.Linq.XDocument`**
  - *What it is:* a .NET class representing an entire, real XML document
    loaded into memory.
  - *Implementation:* a public class in `System.Xml.Linq`.
  - *Its use:* the starting point for reading this lesson's real sample
    file at all.
  - *Type:* a public class.
  - *Responsibility:* parsing a real XML file's text into a real,
    navigable object tree, and exposing that tree's single root element.
  - *Depends on:* a real, well-formed XML file.
  - *Connects to:* its `Root` property (below) is the only member this
    lesson's own code reads.
  - *Shape:* the entry point into every real XML document this project
    will ever read, starting here.
- **`XDocument.Load(string)`**
  - *What it is:* the `static` method that reads a real file from disk
    and parses it into a real `XDocument`.
  - *Implementation:* a `static` method on `XDocument`, taking a file
    path and returning a fully-parsed `XDocument`.
  - *Its use:* the one call that turns this lesson's real sample file
    into a real, in-memory object tree.
  - *Type:* a `static` method.
  - *Responsibility:* reading, parsing, and validating a real XML file's
    text, producing a real object tree or throwing if the file isn't
    well-formed XML at all.
  - *Depends on:* a real, existing, well-formed XML file at the given
    path.
  - *Connects to:* called once, inside `DescribeTree`.
  - *Shape:* this lesson's one real, OS-facing call — everything after it
    works entirely with in-memory objects.
- **`XDocument.Root`**
  - *What it is:* the property holding a document's single, top-level
    element.
  - *Implementation:* a settable property of type `XElement` (below,
    nullable in practice for a document with no content at all, hence
    this lesson's own `!` null-forgiving usage, already fully explained).
  - *Its use:* the starting point for this lesson's own recursive
    description — every other element in the document is reached from
    here, by repeatedly asking for children.
  - *Type:* an instance property.
  - *Responsibility:* holding the one element every other element in the
    document is, directly or indirectly, a descendant of.
  - *Depends on:* a successfully loaded `XDocument`.
  - *Connects to:* read once, inside `DescribeTree`; handed directly into
    the first call to `DescribeElement`.
  - *Shape:* the single door into an entire document's worth of
    structure.
- **`System.Xml.Linq.XElement`**
  - *What it is:* a .NET class representing one single element inside an
    XML document — a name, a set of attributes, and any number of child
    elements or text.
  - *Implementation:* a public class in `System.Xml.Linq`.
  - *Its use:* the real type this lesson's entire recursive walk moves
    through, one element at a time.
  - *Type:* a public class.
  - *Responsibility:* representing exactly one XML element and everything
    it directly contains.
  - *Depends on:* being produced by `XDocument.Load`'s own internal
    parsing — never constructed directly by this lesson's own code.
  - *Connects to:* every element in the document is an `XElement`; this
    lesson's own recursion moves from one to its children via `Elements()`
    (below).
  - *Shape:* the real, in-memory object standing in for what an **XML
    element** (already fully explained, in an earlier lesson, as the raw
    markup concept) actually becomes once a real document is parsed —
    the identical relationship an earlier lesson already proved for XAML
    specifically, now shown for a document with nothing to do with WPF at
    all.
- **`XElement.Name`**
  - *What it is:* the property holding an element's own tag name.
  - *Implementation:* a property of type `XName` (a small, specialized
    .NET type representing an XML name, capable of also carrying a
    namespace when one is present — not exercised by this lesson's own
    sample file, which uses none).
  - *Its use:* read once per element, to print its name as part of this
    lesson's tree description.
  - *Type:* an instance property.
  - *Responsibility:* holding exactly this element's own tag name, as it
    appeared in the real file.
  - *Depends on:* the `XElement` already existing.
  - *Connects to:* read inside `DescribeElement`; printed directly.
  - *Shape:* the one piece of information this lesson's whole tree
    description is actually built from — every line printed is, at its
    core, one element's `Name`.
- **`XElement.Elements()`**
  - *What it is:* the method returning an element's own *direct* children
    — one level down, not every descendant at every depth.
  - *Implementation:* an instance method returning
    `IEnumerable<XElement>` (an **interface**, already fully explained, in
    an earlier lesson, for a completely different type of sequence).
  - *Its use:* the exact mechanism this lesson's own recursion uses to
    find what to call itself on next — one call per direct child, not
    every element in the whole subtree at once.
  - *Type:* an instance method.
  - *Responsibility:* reporting exactly the elements sitting one level
    directly inside this one — no deeper, no shallower.
  - *Depends on:* the `XElement` it's called on.
  - *Connects to:* its result is walked by this lesson's own `foreach`
    loop (already fully explained), each element triggering one more
    recursive call.
  - *Shape:* the deliberately narrow choice this lesson makes — a
    sibling method, `Descendants()`, would return *every* element at
    every depth in one flat sequence, which this lesson's own recursive
    approach specifically doesn't want, since depth itself is exactly
    what this lesson's indentation needs to track.
- **`System.Xml.Linq.XAttribute`** and **`XElement.Attributes()`**
  - *What they are:* `XAttribute` represents one single attribute on an
    element; `Attributes()` is the method returning all of an element's
    own attributes.
  - *Implementation:* `Attributes()` is an instance method on `XElement`
    returning `IEnumerable<XAttribute>`; `XAttribute` exposes its own
    `Name` (an `XName`, the identical type `XElement.Name` uses) and
    `Value` (a plain `string`) properties.
  - *Their use:* this lesson's sample file's own `NAME` and `NUMBER`
    attributes (on `NCFILE`, `OPERATION`, and `TOOL`) are read and printed
    alongside each element's own name.
  - *Type:* an instance method and a class, respectively.
  - *Responsibility:* `Attributes()` reports every attribute an element
    actually has; each `XAttribute` holds exactly one name/value pair.
  - *Depends on:* the `XElement` they belong to.
  - *Connects to:* read inside `DescribeElement`, via a nested `foreach`
    loop (already fully explained).
  - *Shape:* the second half of what an **XML attribute** (already fully
    explained generically, in an earlier lesson) actually becomes once a
    real document is parsed — mirroring `XElement`'s own relationship to
    the generic **XML element** concept.

---

## Concept Unit: Loading a Real XML File — `XDocument` and `.Root`

### The Problem

Nothing in this project has ever opened a real XML file and looked
inside it — every `.xml` file this project has touched so far
(`DirectoryScanner`'s discoveries, `FileDateParser`'s filenames) has been
treated purely as a name and a timestamp, never as a document with actual
content. This project needs a real, concrete setup-sheet-shaped XML file
to explore in the first place — none has existed anywhere in this
project until now.

> If you needed to describe a real Mastercam setup sheet's shape well
> enough to write about it honestly — repeated `NCFILE` entries, nested
> `OPERATION`s, `TOOL`s appearing in more than one place — without an
> actual Mastercam installation to export one from, what would the most
> honest way to get a real file to examine actually be?

### Introduce the Concept in Isolation

No new isolated example for the file itself — this lesson's real sample
file, built directly from this curriculum's own `brd.md` (its documented
placeholder quirks — `<DESCRIPTION>PART NAME</DESCRIPTION>`, `<CUSTOMER>
REV</CUSTOMER>`, `<DRAWING-NUMBER>PROGRAM NUMBER</DRAWING-NUMBER>` — and
its explicit note that `NCFILE` siblings repeat and `TOOL` appears at
multiple depths), is the real, concrete artifact this lesson needs, not a
throwaway stand-in for it.

For `XDocument.Load` itself, a tiny, uninvolved call, its behavior
predictable with real confidence — loading a well-formed file into an
object tree is `XDocument`'s single most basic, most stable, most
thoroughly documented operation:

```csharp
XDocument document = XDocument.Load(filePath);
XElement root = document.Root!;
```

### Discard the Throwaway Example

Not applicable — this unit's real subject is the actual sample file this
lesson creates, not a separate throwaway version of it.

### Project Change

- **Reference Source** — no reference counterpart. This lesson's sample
  file is a from-scratch construction, built to match `brd.md`'s own
  documented structural facts, since no real Mastercam export exists
  anywhere in this read-scoped project.
- **Files affected** — created: `SampleData/SetupSheet_2026-08-26_0512.xml`
  and `SampleData/` itself (a new subfolder), and `XmlExplorer.cs`, both
  in the `MastercamGenerator/` project folder.
- **Change type** — add, both.
- **Location** — n/a; both are new.
- **Dependencies** — none beyond the project itself already existing.

### The New Code

The real sample file's own root and metadata section (its full contents
are shown in this lesson's final Concept Unit, once the explorer that
reads all of it exists):

```xml
<SETUPSHEET>
  <DESCRIPTION>PART NAME</DESCRIPTION>
  <CUSTOMER>REV</CUSTOMER>
  <DRAWING-NUMBER>PROGRAM NUMBER</DRAWING-NUMBER>
  <NCFILE NAME="SetupSheet_2026-08-26_0512">
```

`XmlExplorer.cs`'s starting shell:

```csharp
using System.Xml.Linq;

namespace MastercamGenerator;

public class XmlExplorer
{
    public string DescribeTree(string filePath)
    {
        XDocument document = XDocument.Load(filePath);
        return DescribeElement(document.Root!, 0);
    }
}
```

### The Updated Project

This *is* the whole new structure for `XmlExplorer.cs` — a brand-new file
with nothing surrounding it yet, aside from a call to `DescribeElement`
that doesn't exist until this lesson's next two Concept Units — so there
is nothing further to return to for this unit specifically.

### Mechanical Walkthrough

1. `using System.Xml.Linq;` — a **`using` directive** (already fully
   explained), bringing `XDocument`, `XElement`, and `XAttribute` (all
   Header above) into scope by their short names.
2. `public string DescribeTree(string filePath)` — a method declaration:
   `public` (already fully explained), returning `string`, taking one
   `string` parameter.
3. `XDocument document = XDocument.Load(filePath);` — calls **`XDocument.
   Load(string)`** (Header above), storing the resulting **`XDocument`**
   (Header above) in a local variable.
4. `return DescribeElement(document.Root!, 0);` — reads **`XDocument.
   Root`** (Header above), applies the **null-forgiving operator** `!`
   (already fully explained) to it — legal certainty here, since a
   successfully loaded, well-formed document always has a real root
   element — and passes it, along with the literal `0` (the starting
   depth), to `DescribeElement` (this lesson's own subject, filled in by
   its next two Concept Units), returning whatever that call ultimately
   produces.

### CS Lens

Building a small, honest, from-scratch sample file, grounded in a real
document's own written specification (`brd.md`'s own quirks), rather than
inventing a completely arbitrary one, is a real instance of **grounding a
model in a real specification** — the same discipline that separates a
useful test fixture from a toy example that happens to compile. Also
recognized in: a flight simulator's terrain built from real elevation
survey data rather than an artist's rough guess; a tax-form validator's
test cases built from the real published form instructions rather than
invented edge cases that might not reflect anything the real form
actually requires; a crash-test dummy built to match real, measured human
body proportions rather than a convenient round number.

### SE Lens

The alternative — writing a lesson that only *describes* what a setup
sheet looks like, in prose, without a real file to actually load and run
code against — was available, and would still convey the general shape.
It fails this curriculum's own standing rule that a claim about real
behavior needs real, executed proof: without an actual file, every claim
this lesson makes about `XDocument.Load`, `Elements()`, or recursion's own
depth-handling would be exactly the kind of "reads like it should work"
assertion this curriculum's schema exists to catch, not an honestly
verified fact.

### Commands Needed

None yet beyond `dotnet build`, run once for this lesson's whole batch of
changes at the end.

### Run It

Not applicable yet — `DescribeElement` doesn't exist; nothing can run
successfully until this lesson's next two Concept Units define it.

### Connecting Back

A real sample file now exists in this project, and `XmlExplorer` can load
it into a real, navigable `XDocument`. The next Concept Unit gives it
something to actually read from each element it finds.

---

## Concept Unit: An Element's Name and Attributes

### The Problem

`document.Root` (previous Concept Unit) is a real `XElement` — but
nothing yet reads anything from it. This project needs to know what an
element is actually called, and what attributes it carries, before it can
describe anything about it at all.

> This project's own sample file's `NCFILE` element carries a `NAME`
> attribute; its `OPERATION` and `TOOL` elements each carry a `NUMBER`
> attribute. If a method needed to describe *any* element generically —
> not specifically an `NCFILE` or an `OPERATION` — without knowing in
> advance which attributes, if any, it might have, what would it need to
> ask for: a specific, named attribute, or the complete set, whatever it
> turns out to contain?

### Introduce the Concept in Isolation

Two small, uninvolved reads, their behavior predictable with real
confidence — reading an already-parsed element's own name and attributes
is `XElement`'s most basic operation, not something requiring fresh proof
beyond what this lesson's final Concept Unit already captures for the
real document as a whole:

```csharp
XElement operation = ...;
Console.WriteLine(operation.Name);

foreach (XAttribute attribute in operation.Attributes())
{
    Console.WriteLine(attribute.Name + "=" + attribute.Value);
}
```

For this project's own real `<OPERATION NUMBER="10">`, this prints
`OPERATION`, then `NUMBER=10`.

### Discard the Throwaway Example

Not applicable — this unit's own code is a fragment of the real method
this lesson's final code builds, not a separate, discarded example.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — modified: `XmlExplorer.cs`.
- **Change type** — add (the start of the `DescribeElement` method).
- **Location** — inside `XmlExplorer`, alongside `DescribeTree`.
- **Dependencies** — this lesson's previous Concept Unit's class shell.

### The New Code

```csharp
private string DescribeElement(XElement element, int depth)
{
    string indent = new string(' ', depth * 2);
    string line = indent + element.Name;

    foreach (XAttribute attribute in element.Attributes())
    {
        line = line + " [" + attribute.Name + "=" + attribute.Value + "]";
    }

    string result = line + "\n";

    return result;
}
```

### The Updated Project

The full `XmlExplorer.cs`, with the new method marked:

```csharp
1  using System.Xml.Linq;
2  
3  namespace MastercamGenerator;
4  
5  public class XmlExplorer
6  {
7      public string DescribeTree(string filePath)
8      {
9          XDocument document = XDocument.Load(filePath);
10         return DescribeElement(document.Root!, 0);
11     }
12 
13     private string DescribeElement(XElement element, int depth)     // ← new
14     {                                                                // ← new
15         string indent = new string(' ', depth * 2);                  // ← new
16         string line = indent + element.Name;                         // ← new
17 
18         foreach (XAttribute attribute in element.Attributes())       // ← new
19         {                                                            // ← new
20             line = line + " [" + attribute.Name + "=" + attribute.Value + "]";  // ← new
21         }                                                            // ← new
22 
23         string result = line + "\n";                                 // ← new
24 
25         return result;                                               // ← new
26     }
27 }
```

`DescribeElement` now compiles and produces a real, single-line
description of any one element — its indentation, its name, and every
attribute it carries — but stops there; it doesn't yet look at that
element's own children at all.

### Mechanical Walkthrough

1. `string indent = new string(' ', depth * 2);` — constructs a `string`
   made of `depth * 2` repeated space characters, using `string`'s own
   constructor overload that repeats one character a given number of
   times — two spaces per level of depth, this lesson's own chosen
   indentation width.
2. `string line = indent + element.Name;` — reads **`XElement.Name`**
   (Header above), concatenating it onto the indentation with `+`
   (already fully explained).
3. `foreach (XAttribute attribute in element.Attributes())` — a
   **`foreach` loop** (already fully explained) over
   **`XElement.Attributes()`**'s (Header above) own result.
4. `line = line + " [" + attribute.Name + "=" + attribute.Value + "]";`
   — inside the loop: reads each **`XAttribute`**'s (Header above)
   `Name` and `Value`, appending a bracketed `name=value` pair onto
   `line` for each one found.
5. `string result = line + "\n";` — appends a newline character,
   ensuring this element's own description occupies exactly one line
   once printed.
6. `return result;` — a **`return` statement** (already fully explained),
   handing back this one element's complete description — still missing
   its children, addressed next.

### CS Lens

Describing "any element at all," generically, by asking only for its
`Name` and `Attributes()` — never assuming, in this method's own code,
that it's specifically an `NCFILE` or a `TOOL` — is the same
**programming to an interface, not an implementation** principle an
earlier lesson already named for `IEnumerable<InputFile>`, applied here
to a document's own structure instead of a collection's contract: this
method works identically whether it's describing the document's root,
a deeply nested `HOLDER`, or anything else, because it only ever asks
questions every single `XElement` can always answer. Also recognized in:
a museum's coat-check counter accepting any coat, regardless of size or
color, because it only needs to know "hang this, give back a ticket"; a
universal charger accepting any device using the same physical
connector, regardless of what's actually inside it.

### SE Lens

The alternative — writing separate description logic for `NCFILE`,
`OPERATION`, and `TOOL` individually, each formatted specifically for
what that particular element usually contains — was available, and could
produce more specifically tailored output (labeling `NUMBER` as
"Operation #10" rather than a bare attribute pair, for instance). It's
not chosen because this lesson's whole point is exploring a document
whose full real shape isn't confirmed yet — hard-coding per-element
formatting now would mean re-deriving and re-testing that formatting the
moment any lesson discovers a real setup sheet's actual elements differ
from this lesson's own honest, from-scratch approximation. A generic
description that works on any element at all costs nothing to keep
working correctly, whatever the real document eventually turns out to
contain.

### Commands Needed

None beyond this lesson's shared, end-of-lesson `dotnet build`.

### Run It

Predicted with full confidence for `Name`/`Attributes()`'s own basic
mechanics; this lesson's own real, complete, multi-element output is
shown in full in this lesson's final Concept Unit, once `DescribeElement`
also describes an element's children.

### Connecting Back

`DescribeElement` can now fully describe exactly one element. The next
Concept Unit is what makes it describe an entire document, not just one
element in isolation.

---

## Concept Unit: A Method That Calls Itself — Recursion Walks the Tree

### The Problem

`DescribeElement` (previous Concept Unit) only ever describes the one
element it's given — it has no way to also describe that element's own
children, and *their* children, however many levels deep the real
document actually goes. This project's own real sample file nests
`HOLDER` four levels below the document's root; a different real setup
sheet might nest one level shallower or deeper. Nothing about this
project can know that number in advance.

> If `DescribeElement` needed to describe not just one element, but that
> element and everything nested inside it, at every depth — and the
> exact number of levels isn't known until the real document is actually
> read — would a fixed number of nested `foreach` loops, written by hand,
> one per level, ever be enough? What would happen to a real document one
> level deeper than however many loops were written?

### Introduce the Concept in Isolation

A tiny, uninvolved recursive method, its behavior predictable with real
confidence — this exact control-flow shape is a stable, foundational
programming technique, not a runtime quirk needing fresh proof:

```csharp
string CountDown(int n)
{
    if (n <= 0)
    {
        return "Liftoff!\n";
    }

    return n + "\n" + CountDown(n - 1);
}
```

Calling `CountDown(3)` produces `"3\n2\n1\nLiftoff!\n"` — printed, that's
four lines: `3`, `2`, `1`, `Liftoff!`. `CountDown` calls itself, each time
with a smaller number, until it reaches `0`, at which point it stops
calling itself and simply returns — this is called **recursion**: a
method solving a problem (`CountDown(3)`) by calling itself on a smaller
version of the identical problem (`CountDown(2)`), until the problem
becomes small enough to answer directly.

A real, traced execution, showing exactly what each call does and
returns, since a loop's own prose description isn't sufficient for
tracing recursive calls into each other:

1. `CountDown(3)` — `3 > 0`, so it computes `"3\n" + CountDown(2)`, and
   must wait for that inner call to finish before it can return anything.
2. `CountDown(2)` — `2 > 0`, so it computes `"2\n" + CountDown(1)`, and
   likewise waits.
3. `CountDown(1)` — `1 > 0`, so it computes `"1\n" + CountDown(0)`, and
   likewise waits.
4. `CountDown(0)` — `0 <= 0`, the condition finally matching, so this
   call returns `"Liftoff!\n"` immediately, with no further recursive
   call — this is the point every earlier, waiting call was blocked on.
5. `CountDown(1)`'s own call, now unblocked, finishes computing `"1\n" +
   "Liftoff!\n"`, returning `"1\nLiftoff!\n"`.
6. `CountDown(2)`'s own call finishes computing `"2\n" +
   "1\nLiftoff!\n"`, returning `"2\n1\nLiftoff!\n"`.
7. `CountDown(3)`'s own call finishes computing `"3\n" +
   "2\n1\nLiftoff!\n"`, returning the full `"3\n2\n1\nLiftoff!\n"` — the
   answer to the very first call, only now actually available, after
   every inner call it depended on finished first, in reverse order from
   how they started.

### Discard the Throwaway Example

`CountDown` doesn't appear in the real project — it exists only to
isolate recursion's own control flow before this lesson's real method
(below) does the same thing for a real document's nested elements instead
of counting numbers. Discarded now.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — modified: `XmlExplorer.cs`.
- **Change type** — add (the recursive call, inside `DescribeElement`'s
  existing body).
- **Location** — inside `DescribeElement`, after this lesson's previous
  Concept Unit's attribute loop.
- **Dependencies** — this lesson's previous Concept Unit's
  `DescribeElement`.

### The New Code

```csharp
foreach (XElement child in element.Elements())
{
    result = result + DescribeElement(child, depth + 1);
}
```

### The Updated Project

The full `XmlExplorer.cs`, with the new lines marked:

```csharp
1  using System.Xml.Linq;
2  
3  namespace MastercamGenerator;
4  
5  public class XmlExplorer
6  {
7      public string DescribeTree(string filePath)
8      {
9          XDocument document = XDocument.Load(filePath);
10         return DescribeElement(document.Root!, 0);
11     }
12 
13     private string DescribeElement(XElement element, int depth)
14     {
15         string indent = new string(' ', depth * 2);
16         string line = indent + element.Name;
17 
18         foreach (XAttribute attribute in element.Attributes())
19         {
20             line = line + " [" + attribute.Name + "=" + attribute.Value + "]";
21         }
22 
23         string result = line + "\n";
24 
25         foreach (XElement child in element.Elements())               // ← new
26         {                                                             // ← new
27             result = result + DescribeElement(child, depth + 1);      // ← new
28         }                                                             // ← new
29 
30         return result;
31     }
32 }
```

`DescribeElement` is now genuinely recursive and complete: it describes
one element, then calls itself once per direct child, at one greater
depth, until it reaches an element with no children at all — at which
point `Elements()` returns an empty sequence, this `foreach` loop simply
never runs, and that call returns with no further recursion, the same
natural stopping point `CountDown(0)` already demonstrated for a
completely different kind of problem.

### Mechanical Walkthrough

1. `foreach (XElement child in element.Elements())` — a **`foreach`
   loop** (already fully explained) over **`XElement.Elements()`**
   (Header above) — this element's own *direct* children only, one level
   down.
2. `result = result + DescribeElement(child, depth + 1);` — the
   **recursive call** (Header above): `DescribeElement` calls itself,
   passing `child` (one level deeper into the document) and `depth + 1`
   (one greater than the current depth, so that child's own indentation
   correctly reflects its real position). Whatever that call eventually
   returns — a complete description of `child` *and* everything nested
   inside it — is appended onto `result`.

### CS Lens

This is recursion applied to a genuinely **tree-shaped** problem — the
natural fit recursion has for any data that nests inside itself to an
unknown depth, since each recursive call handles exactly one level, and
the recursion itself, not any hard-coded loop count, is what reaches
however deep the real data actually goes. Also recognized in: a file
explorer listing a folder's contents, recursing into every subfolder it
finds, however deeply nested they turn out to be; a company's own
organizational chart, where describing "everyone under this manager"
naturally means describing each direct report and then everyone under
each of *them*; a set of nested Russian nesting dolls, where opening one
reveals the exact same problem, one size smaller, all the way down to the
smallest one that doesn't open at all.

### SE Lens

The alternative — a single, non-recursive method using an explicit stack
data structure to manually track "which elements still need visiting,
and at what depth" — was available, and is a real, legitimate technique,
sometimes chosen specifically to avoid recursion's own real cost: each
recursive call adds a new frame to the program's call stack, and a
document nested deeply enough (thousands of levels, not the handful this
lesson's own real sample file actually has) could, in principle, exhaust
that stack entirely. Recursion is chosen here because it reads far closer
to the problem's own natural description — "describe this element, then
describe its children the same way" — and because this project's own real
setup sheets nest only a handful of levels deep, nowhere near the depth
where that real cost would ever become a genuine concern.

### Commands Needed

None beyond this lesson's shared, end-of-lesson `dotnet build`.

### Run It

Predicted with full confidence for `CountDown`'s own isolated behavior,
traced by hand above; this project's own real, complete recursive output,
against the real sample file, is shown in full in this lesson's final
Concept Unit.

### Connecting Back

`XmlExplorer` is now complete: given any real XML file, it can describe
every element inside it, at every depth, regardless of how deeply nested
the real document turns out to be. The final Concept Unit runs it for
real, against this lesson's own real sample file.

---

## Concept Unit: Running the Explorer Against the Real Sample File

### The Problem

`XmlExplorer` is complete, on paper — but per this curriculum's own
schema, "reads like it should work" is not proof. Whether it correctly
handles this lesson's own real sample file's repeated `NCFILE` siblings
and multiply-nested `TOOL` elements needs to be shown, not assumed.

### Introduce the Concept in Isolation

No new isolated example — this unit's whole point is running the real,
complete `XmlExplorer` against the real, complete sample file, not a
simplified stand-in for either.

### Discard the Throwaway Example

Not applicable — this unit verifies the real project's own code and data
directly.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — none; this unit verifies `XmlExplorer.cs` and
  `SampleData/SetupSheet_2026-08-26_0512.xml` exactly as they already
  stand at the end of this lesson's previous Concept Units.
- **Change type** — n/a.
- **Location** — n/a.
- **Dependencies** — this lesson's complete `XmlExplorer` and sample
  file.

### Commands Needed

- `dotnet new console -n ScratchXmlExplorerCheck` — scaffolds this unit's
  own throwaway proof project, calling a copy of `DescribeElement`
  identical to the real project's own, against the real sample file's
  real path.
- `dotnet run` — runs it, producing the real output below.

### Run It

Real, captured output from running this lesson's complete logic against
the real, complete `SetupSheet_2026-08-26_0512.xml` (.NET SDK 10.0.301):

```
SETUPSHEET
  DESCRIPTION
  CUSTOMER
  DRAWING-NUMBER
  NCFILE [NAME=SetupSheet_2026-08-26_0512]
    OPERATION [NUMBER=10]
      DESCRIPTION
      TOOL [NUMBER=1]
        DESCRIPTION
        ASSEMBLY
          HOLDER
    OPERATION [NUMBER=20]
      DESCRIPTION
      TOOL [NUMBER=5]
        DESCRIPTION
        ASSEMBLY
          HOLDER
    TOOL [NUMBER=1]
      DESCRIPTION
    TOOL [NUMBER=5]
      DESCRIPTION
  NCFILE [NAME=SetupSheet_2026-08-20_0900]
    OPERATION [NUMBER=10]
      DESCRIPTION
      TOOL [NUMBER=1]
        DESCRIPTION
```

This proves, for real, exactly what this curriculum's own `brd.md` said
to expect: two `NCFILE` elements sit as real siblings under the same
root, each with its own independent set of `OPERATION`s; `TOOL` genuinely
appears at two different depths in the very same `NCFILE` — once nested
three levels down, inside a specific `OPERATION`, and again just one
level down, directly under `NCFILE` itself, as a separate summary
listing. This exact, real distinction — the same tag name, appearing at
two different real depths in the same document — is precisely the fact
this curriculum's own next lesson will need a deliberate choice between
two different query methods to handle correctly.

### Connecting Back

Every earlier Concept Unit in this lesson built one piece of a chain this
unit finally confirms works end to end, against real, complete data: a
loaded document (first unit) provided a real root; per-element
description (second unit) proved correct for one element in isolation;
recursion (third unit) extended that correctness to an entire tree of
unknown depth. This unit is the real, captured proof that all three
pieces, together, correctly describe this project's first real,
substantial XML document.

---

## Connect the Pieces

Trace one call to `DescribeTree` through this lesson's complete chain,
against the real sample file's own repeated structure:

1. `DescribeTree(filePath)` (first Concept Unit) loads the real file via
   `XDocument.Load`, and calls `DescribeElement` once, on the document's
   own root `SETUPSHEET` element, at depth `0`.
2. That call (second Concept Unit) describes `SETUPSHEET` itself — no
   attributes, so no bracketed pairs — then (third Concept Unit) calls
   itself once per direct child: `DESCRIPTION`, `CUSTOMER`,
   `DRAWING-NUMBER`, and two `NCFILE` elements, each recursive call
   running at depth `1`.
3. The first `NCFILE` call describes itself, with its own `NAME`
   attribute, then recurses into *its* own children: two `OPERATION`
   elements and two `TOOL` elements, all at depth `2`.
4. Each `OPERATION` call recurses further, into its own nested `TOOL`
   (a *different* real element from the summary `TOOL`s one level up,
   despite sharing the identical tag name) at depth `3`, which itself
   recurses into `ASSEMBLY`, then `HOLDER`, at depths `4` and `5`.
5. Each of these calls, once its own children are exhausted (`Elements()`
   returning nothing further to recurse into), returns its own completed
   description back up to whichever call was waiting on it — the exact
   unwinding this lesson's own isolated `CountDown` trace already showed,
   now happening across a real document's genuinely irregular shape
   rather than a simple countdown.
6. The second `NCFILE`, a real sibling of the first, is described the
   identical way, independently, proving this lesson's own recursive
   method handles repeated structure correctly without any special-case
   code written for "the second one."

This project now has real, verified proof of exactly the document shape
this curriculum's own outline described from the start: nested elements,
repeated siblings, and one tag name — `TOOL` — appearing at genuinely
different depths within the same real file. The next lesson uses LINQ,
not recursion, to ask targeted questions of this exact same document
shape — and needs a deliberate choice between two real query methods
precisely because of the multi-depth `TOOL` fact this lesson just proved
real.
