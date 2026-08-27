# Lesson 16: Data Meant to Change — Creating the Root `Part` Object

**What you will build.** A `Part` class — this project's first true
*domain* object — holding a part's own real-world identity:
`PartNumber`, `Description`, `Customer`, `Revision`. Nothing parses XML
into it yet; this lesson builds only the shape itself, deliberately
before anything fills it in. What this lesson is actually about goes
past these four properties: an earlier lesson's `InputFile` was this
project's first data-only type, and it was a `record`, chosen
specifically because a discovered file's facts never change once
observed. `Part` looks superficially identical — a small bag of named
values — and yet this lesson deliberately does *not* make it a record.
This project's own `brd.md` explicitly requires specific fields to be
user-editable later, with every change tracked; a `Part` is data that's
going to change, in place, over its own lifetime, and that one real
difference is what actually decides which of two similar-looking C#
tools is the right one.

**What you need to know first.** Lesson 4 — `InputFile`, this project's
own `record` precedent, and the **`init` accessor** it relies on — this
lesson's own point depends on contrasting against it directly. Lesson 14
— `XElement`, the real, in-memory object a parsed XML document is made
of, which this lesson's own closing Concept Unit contrasts `Part`
against.

**Terms used in this lesson.**

- **auto-implemented property (`{ get; set; }`)** — a C# property whose
  backing storage the compiler generates automatically, rather than a
  field the programmer declares and references by hand inside a written
  `get`/`set` body. Written as `public string PartNumber { get; set; }`,
  with no field anywhere in sight — the compiler creates one internally,
  invisibly, solely to back this exact property. It exists for the most
  common case of all: a property that does nothing beyond store a value
  and hand it back, with no extra logic in either direction — writing out
  a private field and two trivial accessor bodies by hand for that case
  is pure repetition a language feature can remove entirely.
- **auto-property initializer** — a value written directly after an
  auto-implemented property's closing brace, `public string PartNumber
  { get; set; } = "";`, assigned to that property's own generated backing
  storage once, automatically, before any constructor body runs — the
  identical mechanism, and the identical timing, an earlier lesson's own
  field initializers already established, just spelled directly on a
  property instead of a field. It exists here specifically to satisfy
  this project's own `<Nullable>enable</Nullable>` setting (already fully
  explained, in an earlier lesson): a `string`-typed property with no
  initializer, and no constructor assigning it, produces a real compiler
  warning (`CS8618`) for potentially leaving a non-nullable property
  unset — the initializer is what genuinely prevents that, honestly,
  rather than suppressing the warning without fixing the actual gap it's
  pointing at.

**Objects and methods used.**

- **`Part`**
  - *What it is:* this project's first true domain object — a typed
    representation of a part's own real-world identity, independent of
    any file format or user interface.
  - *Implementation:* `public class Part` in the `MastercamGenerator`
    namespace — a `class`, not a `record`, the entire subject of this
    lesson's own second Concept Unit.
  - *Its use:* the root of the domain model this curriculum's own outline
    builds across several lessons (`NcFile`, `Operation`, `Tool`, and
    more, each a later lesson's own subject) — the first of them, and the
    one every other domain object will eventually hang off of.
  - *Type:* a public class, instantiated with `new Part()`.
  - *Responsibility:* holding a part's own identifying facts, in a form
    application code can read and — deliberately, unlike `InputFile` —
    change, field by field, over time.
  - *Depends on:* nothing beyond being constructed.
  - *Connects to:* not yet connected to anything else in this project —
    no parser fills it in yet, and no UI displays it yet; both are later
    lessons' own responsibility.
  - *Shape:* a tenth real dependency boundary in this project, and a
    genuinely new *kind* of one: every earlier class did something
    (scanned, watched, waited, parsed); `Part` exists purely to *be*
    something, the same role an earlier lesson's `InputFile` already
    filled once, for a different, more permanent kind of data.

---

## Concept Unit: A Domain Object With Plain, Mutable Properties

### The Problem

This project has never needed a type representing a part's own
identifying facts — `PartNumber`, `Description`, `Customer`, `Revision`
— because nothing until now has looked past a file's name and timestamp
into what it's actually a setup sheet *for*. An earlier lesson's own
`WatcherStatus` had properties too, but every one of them needed a full,
hand-written body specifically to raise `PropertyChanged` — `Part` has no
such need yet; nothing is bound to it, and nothing needs to be told when
it changes.

> `WatcherStatus`'s own properties, from an earlier lesson, each needed a
> private backing field and a hand-written `get`/`set` body, specifically
> to call `PropertyChanged?.Invoke(...)` on every write. If a property
> needs to do nothing at all beyond store a value and hand it back — no
> notification, no validation, nothing — would that same amount of
> hand-written ceremony still be justified?

### Introduce the Concept in Isolation

A tiny, uninvolved class, its behavior predictable with full confidence
— auto-implemented properties are among the most basic, stable,
thoroughly documented C# features, unrelated to any framework-specific
behavior:

```csharp
public class Point
{
    public int X { get; set; } = 0;
    public int Y { get; set; } = 0;
}

var origin = new Point();
origin.X = 5;
```

`origin.X` now reads `5` — plain, ordinary property assignment and
read-back, with no field named anywhere in this code at all. The compiler
generates one, privately, purely to give `X` and `Y` somewhere real to
store their values.

### Discard the Throwaway Example

`Point` doesn't appear in the real project — it exists only to isolate
the **auto-implemented property** (Header above) and its **initializer**
(Header above) before this lesson's real class (below) does the same
thing for a part's own real fields instead of plain coordinates.
Discarded now.

### Project Change

- **Reference Source** — no reference counterpart. `Part`'s exact four
  starting fields (`PartNumber`, `Description`, `Customer`, `Revision`)
  come directly from this curriculum's own outline, matching the same
  vocabulary `brd.md` itself uses throughout.
- **Files affected** — created: `Part.cs`, in the `MastercamGenerator/`
  project folder.
- **Change type** — add (a brand-new file).
- **Location** — n/a; the start of a new file.
- **Dependencies** — none beyond the project itself already existing.

### The New Code

```csharp
namespace MastercamGenerator;

public class Part
{
    public string PartNumber { get; set; } = "";
    public string Description { get; set; } = "";
    public string Customer { get; set; } = "";
    public string Revision { get; set; } = "";
}
```

### The Updated Project

This *is* the whole new structure — a brand-new file with nothing
surrounding it yet — so there is nothing further to return to.

### Mechanical Walkthrough

1. `namespace MastercamGenerator;` and `public class Part` — the same
   **namespace** and plain **`class`** declaration pattern (already fully
   explained) as every other application class in this project — no base
   type, the identical shape `FileSource` and every class since it has
   used.
2. `public string PartNumber { get; set; } = "";` — an **access
   modifier** (already fully explained) of `public`; the property's type,
   `string`; its name, `PartNumber`; an **auto-implemented property**
   (Header above), `{ get; set; }`, with both accessors public, unlike an
   earlier lesson's own `{ get; private set; }`; and an **auto-property
   initializer** (Header above), `= "";`, setting it to an empty string
   the instant a `Part` is constructed, before any other code can observe
   it.
3. `public string Description { get; set; } = "";`, `public string
   Customer { get; set; } = "";`, and `public string Revision { get; set;
   } = "";` — three more properties, each following the identical
   pattern.

### CS Lens

Reaching for the plainest possible tool — an auto-implemented property
with no extra logic at all — when nothing beyond storing and returning a
value is actually needed, is a real instance of **YAGNI** ("You Aren't
Gonna Need It"), a genuine, named software engineering principle: don't
build machinery (a private field, a hand-written accessor body, a
notification event) for a capability nothing in the system currently
requires. `Part`'s own properties may well need to become full,
hand-written properties later — the moment editing them needs to raise a
notification, or validate a value, or track an edit for the audit trail
`brd.md` itself describes — but that need doesn't exist yet, and writing
that machinery now, speculatively, would be exactly the premature
complexity YAGNI warns against. Also recognized in: a bridge built to
today's actual traffic volume, not a hypothetical future one; a database
table with only the columns a current feature actually reads and writes,
not ones "we might need eventually"; a recipe that doesn't season for a
dietary restriction nobody at the table actually has.

### SE Lens

The alternative — writing `PartNumber` and its three siblings as full
properties with explicit backing fields and hand-written `get`/`set`
bodies, the same shape `WatcherStatus` already needed — was available,
and would compile and behave identically to the auto-implemented version
for everything this lesson's own code does. It's not chosen because it
would be four private fields and roughly twenty lines of pure repetition,
today, for a notification requirement (`INotifyPropertyChanged`, already
fully explained) that doesn't exist on `Part` yet — a real, if smaller,
version of the same premature-complexity cost this lesson's own CS Lens
already named. The real cost paid for the auto-implemented version
instead: if `Part` does eventually need `INotifyPropertyChanged`, every
one of these four properties will need to be rewritten into a full body
at that point — a real, deferred cost, accepted deliberately rather than
paid speculatively now.

### Commands Needed

None — this lesson's own class needs no real build to confirm; every
construct it uses is already fully proven, stable, ordinary C#.

### Run It

Stated with real confidence, not executed: auto-implemented properties
and their initializers are foundational, thoroughly documented C#
language features, unchanged since their introduction — there is no
genuine uncertainty here for a real run to resolve.

### Connecting Back

`Part` now exists as a real, working class — a plain bag of four
settable facts. The next Concept Unit is the reason it's a `class` at
all, rather than the `record` an earlier lesson's own `InputFile` already
established as this project's precedent for exactly this shape of type.

---

## Concept Unit: Records vs. Classes — Why `Part` Isn't a Record

### The Problem

An earlier lesson's own `InputFile` is a `record` — three named values,
travelling together, with `init`-only properties, locked the instant
they're constructed. `Part`, this lesson's own subject, looks
superficially identical: four named `string` values, travelling
together. A reader who only skimmed `InputFile`'s own lesson could
reasonably expect `Part` to be a record too — and this lesson's own
previous Concept Unit deliberately made it a `class` instead, with
ordinary, reassignable `set` accessors.

> `brd.md`, this project's own requirements document, explicitly states
> that specific fields "can be corrected without touching the source
> file, and every such change is tracked with a full audit trail." An
> earlier lesson's own `init` accessor makes a property assignable
> exactly once, at construction, and never again afterward. Could a
> `Part` built as a `record`, with `init`-only properties, actually
> satisfy that real, stated requirement at all?

### Introduce the Concept in Isolation

No new isolated example — an earlier lesson's own `Point p = new
Point(3, 4);` and this lesson's own `Point`/`origin.X = 5;` (both already
run through this lesson's own Concept Isolation step, and an earlier
lesson's own record isolation for `InputFile`) already demonstrate both
shapes in full; the only new fact here is naming, explicitly, *why* one
shape and not the other fits `Part`'s own real requirement — a reasoning
step, not a new syntactic construct needing its own lab.

### Discard the Throwaway Example

Not applicable — no new throwaway example was written for this unit.

### Project Change

- **Reference Source** — `brd.md`'s own Goals section, item 4: "specific
  fields (tool comment, holder name, stick-out, TA number, etc.) can be
  corrected without touching the source file, and every such change is
  tracked with a full audit trail."
- **Files affected** — none; this unit explains an already-made decision
  (this lesson's previous Concept Unit's `class Part`), rather than
  adding new code of its own.
- **Change type** — n/a.
- **Location** — n/a.
- **Dependencies** — this lesson's previous Concept Unit's `Part` class.

### Mechanical Walkthrough

Not applicable — no new code this unit; the comparison below is between
two already-fully-explained shapes (an earlier lesson's `record
InputFile`, Header above there, and this lesson's own `class Part`,
Header above here), not a new syntactic construct to enumerate.

### CS Lens

This is the real, practical distinction between **value semantics** and
**reference semantics with mutable identity** — a `record`'s own
`init`-only properties exist to support the first: a value meant to be
compared, copied, and trusted never to change out from under whoever's
holding it, exactly `InputFile` an earlier lesson already used it for. A
`class` with ordinary `set` accessors supports the second: one
particular object, with its own persistent identity, whose *state*
changes over time while remaining the same object — exactly what a
`Part` needs to be, if a user is going to correct its `Customer` field
next week without that correction meaning "this is now a different
part." Also recognized in: a birth certificate (immutable — the facts it
records never change, and a new one is issued rather than the old one
edited) versus a medical chart (the same patient's, continuously updated,
correction after correction, each one tracked); a receipt (fixed the
moment it's printed) versus a running account balance (the same account,
correctly described as still itself after every deposit and withdrawal).

### SE Lens

The alternative — building `Part` as a `record` anyway, and "editing" it
by constructing a brand-new `Part` with one field changed (a real,
supported technique for records, using C#'s own `with` expression, not
otherwise used in this lesson) — was available. It's not chosen because
`brd.md`'s own requirement isn't just "produce an updated value" — it's
"track who changed what, when, old value versus new value," which
inherently means something has to persist, identifiably, as *the same
part*, before and after the edit, for the audit trail to describe a
change happening *to* it. A freshly-constructed replacement `Part` has no
inherent connection to the one it replaced without extra bookkeeping this
project would have to build anyway — choosing a mutable `class` up front
means that bookkeeping (a later lesson's own responsibility, once
editing and the audit trail are actually built) has a real, persistent
object to attach itself to, rather than a series of disconnected,
value-equal snapshots.

### Commands Needed

None.

### Run It

Not applicable — this unit contains no new code to run.

### Connecting Back

`Part` is now not just a class, but a *deliberately* chosen one — the
first domain object in this project built around the expectation that it
will change, in place, over its own lifetime. The final Concept Unit
places `Part` against the other kind of object this project has recently
spent two lessons working with: the raw XML itself.

---

## Concept Unit: Domain Objects vs. Document Objects — `Part` vs. `XElement`

### The Problem

Two earlier lessons built real, working code that reads a document's own
raw shape — `XElement`, `Elements()`, `Descendants()` — and this lesson
just built `Part`, a class with no connection to XML at all. Nothing yet
explains why this project needs *both*: an `XElement` already holds
`DESCRIPTION`'s real text, somewhere, inside the document `XDocument.
Load` already parses. Why isn't that enough?

> An earlier lesson's own `XElement` represents "one tag in this specific
> document, with this specific name, holding this specific text" — a
> shape entirely dictated by the real XML file's own tag names
> (`DESCRIPTION`, `CUSTOMER`, `DRAWING-NUMBER`) and structure. If this
> project's own application code — its UI, its future validation logic,
> a future export feature — needed to work with "a part's description"
> directly, would writing `part.Element("DESCRIPTION").Value` everywhere,
> throughout the whole application, be a good idea? What happens to
> every one of those call sites if a future setup sheet format ever
> renames that tag?

### Introduce the Concept in Isolation

No new isolated example — this unit contrasts two already-fully-explained
real types (`Part`, this lesson's own subject; `XElement`, an earlier
lesson's own subject) directly, rather than introducing a new construct
needing its own isolated demonstration.

### Discard the Throwaway Example

Not applicable — no new throwaway example was written for this unit.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — none; this unit is a conceptual contrast, adding
  no new code.
- **Change type** — n/a.
- **Location** — n/a.
- **Dependencies** — this lesson's `Part` and an earlier lesson's
  `XElement`.

### Mechanical Walkthrough

Not applicable — no new code this unit.

### CS Lens

This is the same **Adapter** idea an earlier lesson already named for
`FileInfo` becoming `InputFile` — applied here one layer up, at the level
of an entire domain, not one file's metadata: `Part` is this
application's own, stable vocabulary for what a setup sheet *means*,
independent of the specific tag names, nesting, and quirks (placeholder
values, `TOOL` at multiple depths) a real Mastercam export happens to use
to represent it. Once a real parser exists (a later lesson's own
responsibility) to translate one into the other, every other part of this
application — display, validation, export — can work entirely in terms
of `Part.Description`, never `XElement`, `Elements`, or a literal tag
name string, anywhere outside that one translation step. Also recognized
in: a translator converting a foreign contract into a reader's own
language once, so every subsequent reader works from the translation,
never the original; a customs form converting a shipment's actual
contents into a fixed set of standardized category codes, so every
downstream system works with the codes, not the shipment's own
paperwork; a compiler's parser converting source text into an abstract
syntax tree, so every later compilation stage works with the tree's own
structure, never the original text's exact formatting.

### SE Lens

The alternative — skipping a real domain model entirely, and having this
project's UI, validation, and export logic all work directly against
`XElement`/`XDocument` everywhere they need a part's data — was
available, and would work, today, for reading. It carries a real, and
growing, cost: every one of those call sites would need to independently
agree on exactly which tag names mean what, and every one would break,
silently or loudly, the moment a real setup sheet's actual tag structure
turned out to differ from what was assumed — a real, documented risk
`brd.md` itself already names for `NCFILE` siblings and multi-depth
`TOOL` elements. A real domain model pays a one-time cost — building
`Part` and, later, a real parser to fill it — in exchange for confining
every future assumption about the raw XML's own shape to exactly one
place.

### Commands Needed

None.

### Run It

Not applicable — this unit contains no new code to run.

### Connecting Back

`Part` now stands as this project's own, independent answer to "what is
a setup sheet, really" — deliberately mutable, per this lesson's second
Concept Unit, and deliberately decoupled from XML's own raw shape, per
this unit. Nothing fills it in yet; this curriculum's own outline builds
the rest of the domain model first (`NcFile`, `Operation`, `Tool`, each a
later lesson's own subject) before a real parser connects any of it to
the actual XML.

---

## Connect the Pieces

Trace `Part`'s own reason for existing, start to finish, through every
piece this lesson built:

1. This project needed a way to represent "a part," independently of any
   file format — nothing before this lesson could do that; the closest
   available shape, `XElement`, is tied entirely to one specific
   document's own real tag names and structure.
2. This lesson's first Concept Unit built `Part` as a plain class with
   four auto-implemented, publicly settable properties — the least
   amount of code that could hold those four facts, with no speculative
   machinery for a notification or validation requirement that doesn't
   exist yet.
3. This lesson's second Concept Unit explained why `class`, not `record`:
   `brd.md`'s own explicit requirement — specific fields correctable
   later, every change tracked — needs one persistent, identifiable
   object whose state changes in place, not a sequence of immutable
   snapshots.
4. This lesson's third Concept Unit placed `Part` against `XElement`
   directly: `Part` is this application's own stable vocabulary; `XElement`
   is one specific document's own raw shape. Nothing outside a future
   parser will ever need to know `DESCRIPTION`'s literal tag name, once
   that parser exists.

`Part` today holds nothing — no parser has filled it in, and no UI reads
it. What exists now is the deliberate shape a real part's data will
eventually live in, chosen for the future this application is actually
being built toward, not just the reading this curriculum has done so
far.
