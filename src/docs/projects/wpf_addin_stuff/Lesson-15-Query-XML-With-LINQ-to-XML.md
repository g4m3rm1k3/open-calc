# Lesson 15: One Match or Every Match — Querying XML With LINQ to XML

**What you will build.** A `SetupSheetQueries` class exposing targeted
questions against the real sample setup sheet an earlier lesson already
built and explored: what does the root metadata say, which `NCFILE`
elements exist, which `OPERATION`s does a given one contain, and — this
lesson's central, real point — which `TOOL` elements exist, answered two
genuinely different ways that produce two genuinely different, real
counts on the exact same file. What this lesson is actually about goes
past these specific queries: an earlier lesson's recursive `XmlExplorer`
answered one question — "show me everything" — by walking the entire
document, unconditionally. This lesson introduces the opposite shape:
asking a document a narrow, specific question, and choosing, deliberately,
between two real methods that look similar, read similarly, and produce
different answers on the exact same real data — the kind of choice that's
invisible until it's tested against data that actually exposes it.

**What you need to know first.** Lesson 14 — `XDocument`, `XElement`,
`XAttribute`, and `XElement.Elements()` (its plain, no-argument form),
all reused here unchanged, plus the real sample file
(`SampleData/SetupSheet_2026-08-26_0512.xml`) and its own real, verified
proof that `TOOL` genuinely appears at two different depths in the same
document — the exact fact this lesson's own central comparison depends
on.

**Terms used in this lesson.**

- **`XName` and implicit conversion** — `XName` is the small, specialized
  .NET type (already named, not yet used directly, in an earlier lesson's
  own `XElement.Name` entry) representing an XML name. Every method this
  lesson uses that logically wants an `XName` — `Element`, `Attribute`,
  `Elements`, `Descendants`, all below — can be called instead with a
  plain `string` literal, like `"NCFILE"`, because `XName` defines an
  **implicit conversion operator**: a real, compiler-recognized rule
  letting a `string` be used anywhere an `XName` is expected, with the
  conversion happening automatically, silently, with no cast written by
  hand. It exists so that code querying XML by name reads as plainly as
  possible — `element.Element("DESCRIPTION")` — without every call site
  needing to wrap a literal in some explicit `XName.Get(...)` construction
  first.

**Objects and methods used.**

- **`SetupSheetQueries`**
  - *What it is:* this project's new class representing "a small set of
    specific, named questions this application needs to ask of a real
    setup sheet document."
  - *Implementation:* `public class SetupSheetQueries` in the
    `MastercamGenerator` namespace — no base class, the same plain-class
    shape every application-logic class in this project has used since an
    earlier lesson.
  - *Its use:* a standalone class, this lesson, proving these specific
    queries work correctly against the real sample file — not yet
    connected to any real parsing pipeline, which this curriculum's own
    outline reserves for a later lesson.
  - *Type:* a public class, instantiated with `new`.
  - *Responsibility:* answering a fixed set of specific, named questions
    about a setup sheet document's structure — nothing about loading a
    file (an earlier lesson's own `XDocument.Load`, called by whoever
    uses this class) or describing a document generically (an earlier
    lesson's own `XmlExplorer`).
  - *Depends on:* an already-loaded `XDocument` or `XElement`, handed in
    by whoever calls it.
  - *Connects to:* not yet called from anywhere else in this project —
    this lesson's own verification is its only real caller so far.
  - *Shape:* a ninth real dependency boundary in this project — narrow,
    specific queries, kept separate from both loading a document at all
    and describing one generically.
- **`SetupSheetQueries.GetRootMetadata(XDocument, string)`**
  - *What it is:* the method answering "what does this one specific
    root-level field say."
  - *Implementation:* `public string? GetRootMetadata(XDocument document,
    string elementName)` — a **nullable reference type** (already fully
    explained) return, since a field that doesn't exist has no value to
    report.
  - *Its use:* this lesson's real answer to "find root metadata" — called
    once per field this project cares about (`DESCRIPTION`, `CUSTOMER`,
    `DRAWING-NUMBER`).
  - *Type:* a public instance method.
  - *Responsibility:* looking up exactly one named child of the
    document's root, and reporting its text, or `null` if that field
    isn't present at all.
  - *Depends on:* an already-loaded `XDocument`.
  - *Connects to:* calls `XDocument.Root`, then `XElement.Element(string)`
    (below), then reads `.Value`.
  - *Shape:* the "exactly one, or none" half of this lesson's own two
    query shapes.
- **`SetupSheetQueries.FindNcFiles(XDocument)`** and **`FindOperations(XElement)`**
  - *What they are:* the two methods answering "find every `NCFILE`" and
    "find every `OPERATION` inside a given `NCFILE`" — mechanically
    identical to each other, just applied one level apart in the
    document.
  - *Implementation:* `public IEnumerable<XElement> FindNcFiles(XDocument
    document)` and `public IEnumerable<XElement> FindOperations(XElement
    ncFile)` — both returning an **`IEnumerable<XElement>`** (already
    fully explained, as a category, for a different element type, in an
    earlier lesson).
  - *Their use:* this lesson's real answers to "find `NCFILE` elements"
    and "find operations."
  - *Type:* public instance methods.
  - *Responsibility:* reporting every direct child matching one specific
    tag name — no more, no less.
  - *Depends on:* an already-loaded `XDocument` or `XElement`.
  - *Connects to:* both call `XElement.Elements(XName)` (below).
  - *Shape:* the "every direct child matching this name" half of this
    lesson's own two query shapes.
- **`SetupSheetQueries.FindDirectTools(XElement)`** and **`FindAllTools(XElement)`**
  - *What they are:* the two methods at the exact center of this lesson —
    both claim to "find the tools," and produce genuinely different real
    answers on the identical input.
  - *Implementation:* `public IEnumerable<XElement> FindDirectTools
    (XElement ncFile)`, calling `Elements("TOOL")`; `public IEnumerable
    <XElement> FindAllTools(XElement ncFile)`, calling `Descendants
    ("TOOL")` (below) — real, verified proof that these produce different
    counts on the same real file comes from this lesson's own throwaway
    console check, in this lesson's final Concept Unit.
  - *Their use:* this lesson's own deliberate demonstration that "find
    the tools" is not one unambiguous question.
  - *Type:* public instance methods.
  - *Responsibility:* `FindDirectTools` reports only `TOOL` elements
    sitting directly inside the given `NCFILE`; `FindAllTools` reports
    every `TOOL` element anywhere inside it, at any depth.
  - *Depends on:* an already-loaded `XElement`.
  - *Connects to:* `FindDirectTools` calls `Elements(XName)`;
    `FindAllTools` calls `Descendants(XName)`.
  - *Shape:* the entire reason this lesson exists — proof that choosing
    the wrong one of two similarly-named methods produces a real, silent,
    wrong answer, not a compile error.
- **`XElement.Element(string)`**
  - *What it is:* the method returning a single, specific named child —
    the *first* one found, or `null` if none exists.
  - *Implementation:* an instance method returning `XElement?` (a
    **nullable reference type**, already fully explained) — takes an
    `XName`, here supplied as a plain `string` via implicit conversion
    (Header above).
  - *Its use:* this lesson's own way of reaching exactly one expected
    field — `DESCRIPTION`, `CUSTOMER`, `DRAWING-NUMBER` — each of which
    this project's own sample file has exactly one of.
  - *Type:* an instance method.
  - *Responsibility:* answering "does this specific child exist, and if
    so, what is it" — a genuinely different question from "give me every
    child with this name," which this lesson's own `Elements(XName)`
    (below) answers instead.
  - *Depends on:* the `XElement` it's called on.
  - *Connects to:* its result, possibly `null`, flows into a
    **null-conditional operator** (already fully explained) reading
    `.Value` only if a real element was actually found.
  - *Shape:* the singular counterpart to `Elements()`'s plural — the same
    "one versus many" distinction an earlier lesson's own `FirstOrDefault`
    already drew for a LINQ sequence, now drawn for XML's own child
    lookup instead.
- **`XElement.Attribute(string)`**
  - *What it is:* the singular counterpart to `Attributes()` (already
    fully explained, in an earlier lesson, for enumerating every
    attribute) — returns one specific, named attribute, or `null`.
  - *Implementation:* an instance method returning `XAttribute?`.
  - *Its use:* reading `NCFILE`'s own `NAME` attribute directly, by name,
    rather than searching through every attribute it happens to have.
  - *Type:* an instance method.
  - *Responsibility:* answering "does this element have an attribute with
    this exact name, and if so, what is it."
  - *Depends on:* the `XElement` it's called on.
  - *Connects to:* its result flows into a **null-conditional operator**
    reading `.Value`.
  - *Shape:* the same singular/plural distinction as `Element`/`Elements`,
    applied to attributes instead of child elements.
- **`XElement.Elements(XName)`**
  - *What it is:* the overload of `Elements()` (already fully explained,
    in an earlier lesson, in its plain, unfiltered form) that reports
    only direct children matching one specific name.
  - *Implementation:* an instance method overload, taking an `XName`
    (here, a plain `string`, via implicit conversion), returning
    `IEnumerable<XElement>` — real, verified proof that it correctly
    filters, rather than merely suggesting an intention, comes from this
    lesson's own throwaway console check, in this lesson's final Concept
    Unit.
  - *Its use:* this lesson's real mechanism for "find `NCFILE` elements,"
    "find operations," and the first half of "find the tools."
  - *Type:* an instance method.
  - *Responsibility:* reporting exactly the direct children whose own
    name matches the one given — still only one level down, exactly like
    its unfiltered sibling, just narrowed to one tag name.
  - *Depends on:* the `XElement` it's called on.
  - *Connects to:* its result is what this lesson's own query methods
    return directly.
  - *Shape:* an earlier lesson's own `Elements()` with one additional,
    optional filter — the identical method, doing strictly less work by
    being told, up front, exactly what it doesn't need to report.
- **`XElement.Descendants(XName)`**
  - *What it is:* the method reporting every matching element at *any*
    depth underneath the one it's called on — not just direct children.
  - *Implementation:* an instance method, taking an `XName` (here, a
    plain `string`), returning `IEnumerable<XElement>` — real, verified
    proof of exactly how it differs from `Elements(XName)` on this
    project's own real file comes from this lesson's own throwaway
    console check, in this lesson's final Concept Unit.
  - *Its use:* this lesson's real mechanism for the second half of "find
    the tools" — every `TOOL`, wherever it sits in the document, however
    deeply nested.
  - *Type:* an instance method.
  - *Responsibility:* walking the *entire* subtree underneath the element
    it's called on, at every depth, reporting every element matching the
    given name, regardless of how far down it's nested.
  - *Depends on:* the `XElement` it's called on.
  - *Connects to:* its result flows directly out of `FindAllTools`.
  - *Shape:* the deliberately broader choice this lesson's own final
    Concept Unit proves produces a real, different, larger answer on the
    exact same real file than `Elements(XName)` does — the entire point
    of this lesson.

---

## Concept Unit: A Single Named Child — `Element` and `Attribute`

### The Problem

An earlier lesson's `XmlExplorer` can describe an entire document, but it
answers no specific question — it prints everything, unconditionally.
This project now needs a narrower kind of answer: "what does this
document's `DESCRIPTION` field actually say," not "describe the whole
document and let a person go find it."

> `DESCRIPTION` appears exactly once, directly under this project's real
> sample file's own root element. If code needed to reach that one,
> specific child directly — not walk every child looking for it by hand
> — what would the simplest possible method for "give me the one child
> named this" need to return, given the field in question might not
> exist at all in some other, different real file?

### Introduce the Concept in Isolation

A tiny, uninvolved call, its behavior predictable with real confidence —
`Element`/`Attribute`'s own singular-lookup contract is `XElement`'s most
basic query operation, not something requiring fresh proof beyond what
this lesson's final Concept Unit already captures for the real document
as a whole:

```csharp
XElement? description = root.Element("DESCRIPTION");
string? text = description?.Value;
```

### Discard the Throwaway Example

Not applicable — this unit's own code is a fragment of the real method
this lesson's project change below builds directly, not a separate,
discarded example.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — created: `SetupSheetQueries.cs`, in the
  `MastercamGenerator/` project folder.
- **Change type** — add (a brand-new file).
- **Location** — n/a; the start of a new file.
- **Dependencies** — the real sample file and `XDocument`/`XElement`, all
  from an earlier lesson.

### The New Code

```csharp
using System.Xml.Linq;

namespace MastercamGenerator;

public class SetupSheetQueries
{
    public string? GetRootMetadata(XDocument document, string elementName)
    {
        return document.Root?.Element(elementName)?.Value;
    }

    public string? GetNcFileName(XElement ncFile)
    {
        return ncFile.Attribute("NAME")?.Value;
    }
}
```

### The Updated Project

This *is* the whole new structure — a brand-new file with nothing
surrounding it yet — so there is nothing further to return to.

### Mechanical Walkthrough

1. `public string? GetRootMetadata(XDocument document, string
   elementName)` — a method declaration, returning `string?` (a
   **nullable reference type**, already fully explained), taking the
   document to search and which field's name to look for.
2. `document.Root?.Element(elementName)?.Value` — reads `XDocument.Root`
   (already fully explained), applies the **null-conditional operator**
   `?.` (already fully explained) before calling **`XElement.Element
   (string)`** (Header above) — guarding against a document with no root
   at all, though this project's own real files always have one. `Element
   (elementName)` returns the matching child, or `null`; another `?.`
   guards the final `.Value` read, so a missing field produces `null`
   overall rather than throwing.
3. `public string? GetNcFileName(XElement ncFile)` and its body,
   `ncFile.Attribute("NAME")?.Value` — the identical pattern, this time
   using **`XElement.Attribute(string)`** (Header above) instead of
   `Element`, reading an attribute instead of a child element.

### CS Lens

Returning `null` for "not found," rather than throwing an exception, is
the **Null Object–adjacent design** an earlier lesson's own `TryParseDate`
already established for a completely different kind of lookup: a missing
field is treated as an ordinary, expected outcome — a document that
simply doesn't have a `DESCRIPTION` field is not a broken document, just
one this particular query has nothing to report for. Also recognized in:
a dictionary's `TryGetValue` reporting "not found" rather than throwing;
a search engine returning zero results rather than an error page when
nothing matches a query; a thermostat reporting "no reading yet" rather
than crashing when a sensor hasn't reported a value.

### SE Lens

The alternative — throwing an exception when a requested field doesn't
exist — was available, and is the right choice for some real APIs
(indexing into an array out of bounds, for instance, is deliberately an
error). It's not chosen here because a setup sheet genuinely missing one
optional field is not, by itself, evidence of a real problem — this
project's own later validation logic (a later lesson's own responsibility,
not this one's) is where "is this field's *absence* actually a problem"
gets decided, deliberately, rather than this lookup method deciding it
unilaterally by throwing.

### Commands Needed

None yet beyond `dotnet build`, run once for this lesson's whole batch of
changes at the end.

### Run It

Predicted with full confidence for `Element`/`Attribute`'s own basic
singular-lookup mechanics; this lesson's own real, complete output
against the real sample file is shown in full in this lesson's final
Concept Unit.

### Connecting Back

`SetupSheetQueries` can now answer "what does one specific field say."
The next Concept Unit answers a different shape of question: "find every
child with this name," not just one.

---

## Concept Unit: Filtering `Elements()` by Name

### The Problem

An earlier lesson's `Elements()` returns *every* direct child, regardless
of name — useful for `XmlExplorer`'s own "describe everything," but not
for a query that specifically wants "just the `NCFILE`s," ignoring
`DESCRIPTION`, `CUSTOMER`, and everything else sitting alongside them.

> If `Elements()` already returns every direct child, what would the
> smallest possible change to that same method need to look like, to let
> a caller say "only the ones named this," rather than filtering the
> result by hand afterward with a separate `Where` call?

### Introduce the Concept in Isolation

No new isolated example — `Elements(XName)` is the identical method an
earlier lesson already used, with one additional argument; a fresh
throwaway demonstration would test nothing this lesson doesn't already
know from that earlier, real, proven usage.

### Discard the Throwaway Example

Not applicable — no new throwaway example was written for this unit.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — modified: `SetupSheetQueries.cs`.
- **Change type** — add (two new methods).
- **Location** — inside `SetupSheetQueries`, alongside the existing two
  methods.
- **Dependencies** — this lesson's previous Concept Unit's class shell.

### The New Code

```csharp
public IEnumerable<XElement> FindNcFiles(XDocument document)
{
    return document.Root!.Elements("NCFILE");
}

public IEnumerable<XElement> FindOperations(XElement ncFile)
{
    return ncFile.Elements("OPERATION");
}
```

### The Updated Project

The full `SetupSheetQueries.cs`, with the new methods marked:

```csharp
1  using System.Xml.Linq;
2  
3  namespace MastercamGenerator;
4  
5  public class SetupSheetQueries
6  {
7      public string? GetRootMetadata(XDocument document, string elementName)
8      {
9          return document.Root?.Element(elementName)?.Value;
10     }
11 
12     public string? GetNcFileName(XElement ncFile)
13     {
14         return ncFile.Attribute("NAME")?.Value;
15     }
16 
17     public IEnumerable<XElement> FindNcFiles(XDocument document)      // ← new
18     {                                                                  // ← new
19         return document.Root!.Elements("NCFILE");                     // ← new
20     }                                                                  // ← new
21 
22     public IEnumerable<XElement> FindOperations(XElement ncFile)      // ← new
23     {                                                                  // ← new
24         return ncFile.Elements("OPERATION");                          // ← new
25     }                                                                  // ← new
26 }
```

### Mechanical Walkthrough

1. `public IEnumerable<XElement> FindNcFiles(XDocument document)` and its
   body — `document.Root!.Elements("NCFILE")` — the **null-forgiving
   operator** `!` (already fully explained) on `Root`, since this
   method's own contract assumes a real, loaded document; calls
   **`XElement.Elements(XName)`** (Header above) with the literal
   `"NCFILE"`, converted implicitly (Header above) from `string` to
   `XName`.
2. `public IEnumerable<XElement> FindOperations(XElement ncFile)` and its
   body — the identical pattern, one level deeper in the document,
   filtering to `"OPERATION"` instead.

### CS Lens

`Elements(XName)` doing its own filtering, rather than returning
everything and filtering afterward with a separate LINQ `Where` call, is
a small instance of **pushing a filter down to the source**: the
underlying XML library already knows, while walking the document's own
internal structure, exactly which children match — asking it to filter
directly avoids constructing elements this project has no interest in at
all, however briefly, only to discard them a moment later. Also
recognized in: a database query's own `WHERE` clause filtering rows
before they're ever sent back to the application, rather than fetching
every row and filtering them in memory afterward; a librarian retrieving
only books matching a requested subject directly from the catalog, rather
than pulling every book off every shelf and sorting through them by hand.

### SE Lens

The alternative — calling the unfiltered `Elements()` and following it
with `.Where(e => e.Name == "NCFILE")` — was available, and would produce
an identical real result for this project's own case. `Elements(XName)`
is chosen instead because it states the same intent more directly, in
fewer words, and because the underlying library, not this project's own
code, is responsible for correctly comparing element names (including,
though not exercised by this lesson's own namespace-free sample file, any
XML namespace a real name might carry) — a comparison this project would
otherwise have to get right itself, by hand, inside a `Where` lambda.

### Commands Needed

None beyond this lesson's shared, end-of-lesson `dotnet build`.

### Run It

Predicted with full confidence, not executed standalone: this project's
real, real output against the real sample file, covering this exact
method, is shown in full in this lesson's final Concept Unit.

### Connecting Back

`SetupSheetQueries` can now find every `NCFILE`, and every `OPERATION`
inside one. The next Concept Unit introduces the one query method this
entire lesson exists to contrast against `Elements(XName)`.

---

## Concept Unit: `Descendants()` — Matching at Any Depth

### The Problem

An earlier lesson's own real, verified proof already showed that this
project's real sample file has `TOOL` elements in two different places:
a summary list sitting directly inside `NCFILE`, and separate copies
nested one level deeper, inside each `OPERATION`. `Elements("TOOL")`
(previous Concept Unit), being limited to *direct* children only, cannot,
by its own definition, see the ones nested inside `OPERATION` at all.

> If "find the tools" genuinely needs every `TOOL` in the document,
> regardless of how deep it's nested — not just the ones sitting
> directly inside `NCFILE` — what would a method for that need to do
> differently from `Elements`, which an earlier lesson already proved
> only looks one level down?

### Introduce the Concept in Isolation

No new isolated example — `Descendants(XName)`'s own contract (walk every
level, not just one) is stated plainly enough that a separate throwaway
demonstration would only repeat what this lesson's own final Concept
Unit already proves for real, against the actual file this method needs
to answer for.

### Discard the Throwaway Example

Not applicable — no new throwaway example was written for this unit.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — modified: `SetupSheetQueries.cs`.
- **Change type** — add (two new methods).
- **Location** — inside `SetupSheetQueries`, alongside the existing four
  methods.
- **Dependencies** — this lesson's previous two Concept Units.

### The New Code

```csharp
public IEnumerable<XElement> FindDirectTools(XElement ncFile)
{
    return ncFile.Elements("TOOL");
}

public IEnumerable<XElement> FindAllTools(XElement ncFile)
{
    return ncFile.Descendants("TOOL");
}
```

### The Updated Project

The full `SetupSheetQueries.cs`, with the new methods marked:

```csharp
1  using System.Xml.Linq;
2  
3  namespace MastercamGenerator;
4  
5  public class SetupSheetQueries
6  {
7      public string? GetRootMetadata(XDocument document, string elementName)
8      {
9          return document.Root?.Element(elementName)?.Value;
10     }
11 
12     public string? GetNcFileName(XElement ncFile)
13     {
14         return ncFile.Attribute("NAME")?.Value;
15     }
16 
17     public IEnumerable<XElement> FindNcFiles(XDocument document)
18     {
19         return document.Root!.Elements("NCFILE");
20     }
21 
22     public IEnumerable<XElement> FindOperations(XElement ncFile)
23     {
24         return ncFile.Elements("OPERATION");
25     }
26 
27     public IEnumerable<XElement> FindDirectTools(XElement ncFile)      // ← new
28     {                                                                   // ← new
29         return ncFile.Elements("TOOL");                                // ← new
30     }                                                                   // ← new
31 
32     public IEnumerable<XElement> FindAllTools(XElement ncFile)         // ← new
33     {                                                                   // ← new
34         return ncFile.Descendants("TOOL");                             // ← new
35     }                                                                   // ← new
36 }
```

`SetupSheetQueries` now offers two methods that both claim, by name, to
find "the tools" — one restricted to direct children, one reaching every
depth. Nothing has proven yet that they actually differ on real data;
that's this lesson's final Concept Unit.

### Mechanical Walkthrough

1. `public IEnumerable<XElement> FindDirectTools(XElement ncFile)` and
   its body — the identical `Elements(XName)` pattern (Header above)
   already used twice in this lesson, applied to `"TOOL"`.
2. `public IEnumerable<XElement> FindAllTools(XElement ncFile)` and its
   body — calls **`XElement.Descendants(XName)`** (Header above) instead,
   with the identical literal `"TOOL"` — the one, single-word difference
   between these two methods' entire implementations.

### CS Lens

`Elements` versus `Descendants` is a real instance of **traversal
strategy** — the same underlying tree, walked two genuinely different
ways: one level at a time, stopping immediately, versus every level,
continuing until the entire subtree is exhausted. Choosing the wrong
strategy doesn't fail loudly — both methods compile identically, both
return `IEnumerable<XElement>`, and both run without error on any input
at all; the difference only shows up in *which elements actually come
back*, proven concretely in this lesson's own final Concept Unit. Also
recognized in: searching only a building's ground floor for a person
versus searching every floor; a manager reviewing only their own direct
reports' work versus reviewing everyone anywhere below them in the
organization; a file search restricted to one folder versus one that
also searches every subfolder beneath it.

### SE Lens

The alternative — always using `Descendants`, everywhere, since it
technically finds everything `Elements` would have found and more — was
available, and would never *miss* an element that exists. It carries a
real, opposite risk: `Descendants("TOOL")`, called on the document's own
*root* rather than one specific `NCFILE`, would return every `TOOL` in
the entire document, across every `NCFILE`, when a caller may have wanted
only one file's own tools — silently returning more than intended is
exactly as real a bug as silently returning less. Choosing between the
two deliberately, based on the real question actually being asked ("just
this level" or "everywhere below"), rather than defaulting to whichever
one "can't possibly miss anything," is the actual skill this lesson
exists to teach.

### Commands Needed

None beyond this lesson's shared, end-of-lesson `dotnet build`.

### Run It

Not predicted — this exact comparison, proven with real counts against
the real sample file, is this lesson's own final Concept Unit.

### Connecting Back

`SetupSheetQueries` is now complete. The final Concept Unit is the real
proof this entire lesson has been building toward: that `FindDirectTools`
and `FindAllTools` genuinely disagree, in a real, countable way, on the
exact same real file.

---

## Concept Unit: Proving the Real Difference on the Real File

### The Problem

Every method in `SetupSheetQueries` compiles and reads correctly — but
per this curriculum's own schema, "reads correctly" is not proof that
`Elements("TOOL")` and `Descendants("TOOL")` actually disagree on this
project's own real file, or by how much.

### Introduce the Concept in Isolation

No new isolated example — this unit's whole point is running the real,
complete `SetupSheetQueries` against the real, complete sample file, not
a simplified stand-in for either.

### Discard the Throwaway Example

Not applicable — this unit verifies the real project's own code and data
directly.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — none; this unit verifies `SetupSheetQueries.cs`
  and the real sample file exactly as they already stand.
- **Change type** — n/a.
- **Location** — n/a.
- **Dependencies** — this lesson's complete `SetupSheetQueries` and an
  earlier lesson's real sample file.

### Commands Needed

- `dotnet new console -n ScratchLinqToXmlCheck` — scaffolds this unit's
  own throwaway proof project, calling copies of this lesson's own query
  logic against the real sample file's real path.
- `dotnet run` — runs it, producing the real output below.

### Run It

Real, captured output from running this lesson's complete logic against
the real, complete `SetupSheet_2026-08-26_0512.xml` (.NET SDK 10.0.301):

```
DESCRIPTION: PART NAME
CUSTOMER: REV
DRAWING-NUMBER: PROGRAM NUMBER
NCFILE count: 2
First NCFILE NAME attribute: SetupSheet_2026-08-26_0512
OPERATION count in first NCFILE: 2
Elements("TOOL") count: 2
Descendants("TOOL") count: 4
```

This proves, for real, exactly the disagreement this lesson opened by
promising: on the identical `NCFILE` element, `Elements("TOOL")` reports
`2` — the summary list sitting directly inside it — while
`Descendants("TOOL")` reports `4` — those same two, plus the two more
nested one level deeper, inside each `OPERATION`. Neither method is
"wrong"; each answers the exact question it was actually asked, and
those two questions are genuinely different, even though both are
plausibly described, in English, as "find the tools."

### Connecting Back

Every earlier Concept Unit in this lesson built one piece of a chain this
unit finally confirms with real numbers: a singular lookup (first unit)
and a filtered plural lookup (second unit) both work correctly; a second,
broader plural lookup (third unit) exists specifically because the
first one's own "direct children only" limitation is real, not
theoretical. This unit is the actual, counted proof that limitation
matters, on this project's own real data.

---

## Connect the Pieces

Trace this lesson's central question — "how many tools does this file
have" — through both of this lesson's competing answers, on the exact
same real element:

1. `document.Root!.Elements("NCFILE")` (second Concept Unit) finds this
   project's own real sample file's two `NCFILE` siblings — an earlier
   lesson's own `XmlExplorer` already proved, by exhaustively describing
   the whole document, that exactly two exist; this lesson's own targeted
   query reaches the identical real answer far more directly.
2. Taking the first of those two `NCFILE` elements, `FindDirectTools`
   (third Concept Unit) calls `Elements("TOOL")`, walking exactly one
   level down, and finds `2` — the summary list sitting directly inside
   it, and nothing nested any deeper, because `Elements` was never asked
   to look any deeper.
3. `FindAllTools`, on the identical `NCFILE` element, calls
   `Descendants("TOOL")` instead, walking every level beneath it, and
   finds `4` — the same two summary entries, plus two more genuinely
   different `TOOL` elements, each nested one level inside a separate
   `OPERATION`.
4. Both answers are real, both methods worked exactly as documented, and
   both numbers are simultaneously true — `2` is the correct answer to
   "how many tools sit directly inside this `NCFILE`," and `4` is the
   correct answer to "how many `TOOL` elements exist anywhere inside
   this `NCFILE`, at any depth." The document itself never changed
   between the two calls; only the real question asked of it did.

This is exactly the fact this curriculum's own `brd.md` singled out for
explicit attention, now proven, counted, and real rather than merely
described: a real setup sheet's `TOOL` elements genuinely exist at more
than one depth, and a query written without deliberately choosing between
`Elements` and `Descendants` would silently answer the wrong one of two
real, valid, differently-scoped questions.
