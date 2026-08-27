# Lesson 17: One Object Holding Many — Building `NcFile`

**What you will build.** A new `NcFile` domain class — `ProgramName` and
`ProgramNumber`, the same plain, mutable shape an earlier lesson already
established for `Part` — and a new `NcFiles` property on `Part` itself,
holding a real collection of them. What this lesson is actually about
goes past this one small class: every collection this project has built
so far has held one specific *kind* of thing, gathered from *outside* any
single domain object — `List<InputFile>`, a directory's own discovered
files; `ObservableCollection<InputFile>`, the same files, displayed. This
is the first lesson where a domain object holds a collection of *other*
domain objects, as part of its own identity — `Part` isn't just data
anymore; it's data with real internal structure, an object built out of
other objects.

**What you need to know first.** Lesson 16 — `Part`, its plain-class
shape, and its own reasoning for auto-implemented properties over a
`record`'s `init`-only ones — this lesson's own `NcFile` follows the
identical pattern, for the identical reason. Lesson 5 — `List<T>`, this
project's own first generic collection, reused here to hold domain
objects instead of discovered files.

**Terms used in this lesson.** None new — this lesson recombines
constructs (a plain class with auto-implemented properties, a `List<T>`
property with an initializer) already fully explained in earlier lessons,
applied to a new situation rather than introducing new syntax.

**Objects and methods used.**

- **`NcFile`**
  - *What it is:* this project's second domain object — a typed
    representation of one NC program file belonging to a part.
  - *Implementation:* `public class NcFile` in the `MastercamGenerator`
    namespace — the identical plain-class shape, for the identical
    reason, as an earlier lesson's own `Part`: this is real, editable
    application state, not an immutable fact observed once.
  - *Its use:* the element type of `Part.NcFiles` (below) — every part
    this application eventually represents can have more than one NC
    program associated with it.
  - *Type:* a public class, instantiated with `new NcFile()`.
  - *Responsibility:* holding one NC program's own identifying facts.
  - *Depends on:* nothing beyond being constructed.
  - *Connects to:* held, zero or more at a time, inside `Part.NcFiles`.
  - *Shape:* the first domain object in this project that exists
    specifically to be *contained* by another one, rather than to stand
    alone.
- **`Part.NcFiles`**
  - *What it is:* the new property on `Part` holding every `NcFile`
    belonging to it.
  - *Implementation:* `public List<NcFile> NcFiles { get; set; } = new
    List<NcFile>();` — an **auto-implemented property** (already fully
    explained, in an earlier lesson, for `Part`'s own other four fields)
    of generic type **`List<NcFile>`** (already fully explained, as a
    category, for `List<InputFile>`, in an earlier lesson), with an
    **auto-property initializer** (already fully explained) constructing
    a real, empty list immediately, so `Part.NcFiles` is never `null`.
  - *Its use:* the actual mechanism giving `Part` real internal
    structure — one part, many NC programs.
  - *Type:* a public instance property.
  - *Responsibility:* holding an ordered collection of this specific
    part's own `NcFile`s — nothing about how many, or what's in them, is
    fixed in advance.
  - *Depends on:* nothing beyond the containing `Part` existing.
  - *Connects to:* filled in, eventually, by a real parser (a later
    lesson's own responsibility); read by whatever future code needs to
    know a part's own NC programs.
  - *Shape:* the seam where `Part` stops being a flat bag of four strings
    and becomes a real, structured object graph.

---

## Concept Unit: A New Domain Class — `NcFile`

### The Problem

Nothing in this project can represent one NC program file as a typed
object — an earlier lesson's `Part` holds a part's own identity, but a
real part can be associated with more than one actual NC program, and
nothing yet exists to represent even one of them on its own.

> An earlier lesson's `Part` is a plain class with auto-implemented
> properties, chosen specifically because its own fields are meant to be
> edited later, in place, with changes tracked. Does an `NcFile` — one
> specific NC program's own identifying facts, presumably just as
> correctable as a part's own `Customer` field — have any real reason to
> be built differently?

### Introduce the Concept in Isolation

No new isolated example — this lesson's own Header already states that
no new syntax appears in it; `NcFile`'s own declaration is the identical,
already-isolated pattern an earlier lesson's own `Point` example already
proved for auto-implemented properties and their initializers. Isolating
it a second time would test nothing new.

### Discard the Throwaway Example

Not applicable — no new throwaway example was written for this unit.

### Project Change

- **Reference Source** — no reference counterpart. `NcFile`'s two
  starting fields come from this curriculum's own outline and `brd.md`'s
  own domain vocabulary (a "setup sheet" containing multiple real NC
  programs, each independently identifiable).
- **Files affected** — created: `NcFile.cs`, in the `MastercamGenerator/`
  project folder.
- **Change type** — add (a brand-new file).
- **Location** — n/a; the start of a new file.
- **Dependencies** — none beyond the project itself already existing.

### The New Code

```csharp
namespace MastercamGenerator;

public class NcFile
{
    public string ProgramName { get; set; } = "";
    public string ProgramNumber { get; set; } = "";
}
```

### The Updated Project

This *is* the whole new structure — a brand-new file with nothing
surrounding it yet — so there is nothing further to return to.

### Mechanical Walkthrough

1. `namespace MastercamGenerator;` and `public class NcFile` — the same
   **namespace** and **`class`** declaration pattern (both already fully
   explained) as every other domain and application class in this
   project.
2. `public string ProgramName { get; set; } = "";` and `public string
   ProgramNumber { get; set; } = "";` — two **auto-implemented
   properties**, each with an **auto-property initializer** (both already
   fully explained, in an earlier lesson, for `Part`'s own four fields),
   defaulting each to an empty string so neither ever holds `null` before
   real data fills it in.

### CS Lens

Nothing new to name here beyond what an earlier lesson's own treatment of
`Part` already covered in full — this unit's own point isn't a new
construct, it's recognizing that the identical reasoning (mutable domain
state, meant to be corrected in place, per `brd.md`'s own audit-trail
requirement) applies just as much to one NC program's own facts as to a
part's.

### SE Lens

The alternative — giving `NcFile` different treatment than `Part` (a
`record`, say, on the theory that an NC program's own name and number
are "less likely" to need correction than a part's customer field) — was
available, and would be a real, if quiet, inconsistency: nothing in
`brd.md` actually singles out `Part`'s own fields as uniquely editable
while excluding `NcFile`'s. Applying the identical reasoning consistently,
rather than deciding per-class by feel, is what keeps this project's own
domain model predictable — a future reader shouldn't have to guess, class
by class, which ones are "the mutable kind" and which aren't.

### Commands Needed

None — this lesson's own class needs no real build to confirm; every
construct it uses is already fully proven, stable, ordinary C#.

### Run It

Stated with real confidence, not executed: this unit's own code is a
direct, unmodified repetition of an already-proven pattern, with no
genuine uncertainty for a real run to resolve.

### Connecting Back

`NcFile` now exists as a real, working class, standing entirely on its
own — nothing in this project holds one yet. The next Concept Unit gives
`Part` a real way to hold many of them at once.

---

## Concept Unit: Composition — Giving `Part` a Collection of `NcFile`s

### The Problem

`Part` (an earlier lesson) and `NcFile` (this lesson's own previous
Concept Unit) exist independently, with no connection between them at
all. A real part can be associated with several real NC programs at
once — nothing about `Part`'s own four flat fields can represent that.

> An earlier lesson's `List<InputFile>` held several `InputFile`s at
> once, gathered from scanning a real directory — a collection built
> *outside* any single object and handed around. If `Part` itself needs
> to hold several `NcFile`s as part of *its own* identity — not handed to
> it from outside, but genuinely one of its own properties — what shape
> would that property need: a single `NcFile`, or something that can hold
> any number of them?

### Introduce the Concept in Isolation

No new isolated example — a `List<T>`-typed property with an initializer
combines two constructs (an auto-implemented property, `List<T>` itself)
each already fully proven in earlier lessons; a fresh throwaway version
of the identical combination would test nothing new.

### Discard the Throwaway Example

Not applicable — no new throwaway example was written for this unit.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — modified: `Part.cs`.
- **Change type** — add (one new property).
- **Location** — inside `Part`, alongside its existing four properties.
- **Dependencies** — an earlier lesson's own `Part` and this lesson's own
  `NcFile`.

### The New Code

```csharp
public List<NcFile> NcFiles { get; set; } = new List<NcFile>();
```

### The Updated Project

The full `Part.cs`, with the new property marked:

```csharp
1  namespace MastercamGenerator;
2  
3  public class Part
4  {
5      public string PartNumber { get; set; } = "";
6      public string Description { get; set; } = "";
7      public string Customer { get; set; } = "";
8      public string Revision { get; set; } = "";
9      public List<NcFile> NcFiles { get; set; } = new List<NcFile>();  // ← new
10 }
```

`Part` now has real internal structure: four flat facts, exactly as an
earlier lesson left it, plus a genuine collection of its own `NcFile`s,
starting empty and ready to be filled in.

### Mechanical Walkthrough

1. `public List<NcFile> NcFiles { get; set; } = new List<NcFile>();` —
   an **auto-implemented property** (already fully explained) of type
   **`List<NcFile>`** (a **generic type**, already fully explained, as a
   category, for `List<InputFile>`) — `NcFile`, this lesson's own class,
   filling in the type argument this time. The **auto-property
   initializer** (already fully explained) constructs a real, empty
   `List<NcFile>` immediately, via `new List<NcFile>()`, so this property
   is never `null` — the identical reasoning an earlier lesson's own
   `= "";` already established for `Part`'s string properties, applied
   here to a collection instead of a string.

### CS Lens

`Part` holding a real collection of `NcFile`s, each of which — a later
lesson's own subject — will itself hold a collection of `Operation`s, is
a real **object graph**: a network of objects connected to each other by
reference, rather than a single, flat record. This is a genuinely
different shape than every collection this project has built until now,
which held one flat kind of thing, gathered from outside any single
object (`List<InputFile>`, from a directory scan). Also recognized in: a
company's own organizational chart, where each manager object holds a
real collection of the employee objects reporting to them, who may
themselves manage others; a file system, where each folder object holds
a real collection of the files and other folders inside it; a family
tree, where each person object holds real references to their own
children, each capable of holding more of their own.

### SE Lens

A real, deliberate choice made here, worth stating plainly: `NcFiles` is
a plain `List<NcFile>`, not an `ObservableCollection<NcFile>` (an earlier
lesson's own subject, used for `DiscoveredFilesGrid`'s bound data).
`ObservableCollection<T>`'s entire extra value — announcing its own
changes automatically — only matters when something is actually watching
for them; no UI reads `Part` yet, and none will until a much later
lesson. Reaching for `ObservableCollection<T>` here, before anything
needs to watch it, would be exactly the same premature-complexity mistake
an earlier lesson's own CS Lens already named for `Part`'s own properties
— paying a real, small cost (that class's own event machinery) for a
capability nothing yet uses. If a future lesson eventually binds `Part`'s
own data to a live WPF display, revisiting this specific choice,
deliberately, at that point, is the right time to make it — not now.

### Commands Needed

None — this lesson's own change needs no real build to confirm; every
construct it uses is already fully proven, stable, ordinary C#.

### Run It

Stated with real confidence, not executed: an auto-implemented
`List<NcFile>` property with an inline initializer is a direct
combination of two already-proven constructs, with no genuine
uncertainty for a real run to resolve.

### Connecting Back

`Part` now has real, working internal structure — a genuine object graph,
not just four flat fields. Nothing has filled it in yet; that remains a
later lesson's own responsibility, once enough of the domain model
(`Operation`, `Tool`, and more) exists to give a real parser somewhere
real to put what it finds.

---

## Connect the Pieces

Trace one concrete, hand-built example through both of this lesson's own
Concept Units — not real data yet, since no parser exists, but a real,
valid object graph nonetheless:

```csharp
var part = new Part();
part.PartNumber = "10234-B";

var firstProgram = new NcFile();
firstProgram.ProgramName = "Program1001";
firstProgram.ProgramNumber = "1001";
part.NcFiles.Add(firstProgram);

var secondProgram = new NcFile();
secondProgram.ProgramName = "Program1002";
secondProgram.ProgramNumber = "1002";
part.NcFiles.Add(secondProgram);
```

1. `new Part()` constructs a real `Part` (an earlier lesson's own
   subject); `part.PartNumber = "10234-B";` assigns its property directly
   — its `NcFiles` property is already a real, empty `List<NcFile>`,
   thanks to this lesson's own auto-property initializer, not `null`.
2. `new NcFile()`, followed by two property assignments, builds one real
   `NcFile` (this lesson's own first Concept Unit); `part.NcFiles.Add
   (firstProgram)` appends it to `part`'s own collection, using
   `List<T>.Add` (already fully explained, in an earlier lesson, for a
   different element type). The identical three lines repeat once more
   for a second `NcFile`.
3. `part` now stands as a real, working object graph: one `Part`, holding
   a real collection of two `NcFile`s, each independently identifiable by
   its own `ProgramName` and `ProgramNumber` — exactly the shape this
   curriculum's own outline described at the start of this lesson,
   built and connected by hand, ahead of the real parser that will
   eventually build the identical shape from real XML.

This is still entirely disconnected from anything else in this project —
no UI, no parser, no file on disk. What exists now is the real, correct
shape a later lesson's own parser will need to produce, proven buildable
by hand before any code is asked to build it automatically.
