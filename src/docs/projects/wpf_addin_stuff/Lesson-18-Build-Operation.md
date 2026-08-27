# Lesson 18: A Number That Isn't Just a Number — Building `Operation`

**What you will build.** A new `Operation` domain class — a
`SequenceNumber` and a `Description` — and an `Operations` property on
`NcFile`, following the identical composition pattern an earlier lesson
already established for `Part.NcFiles`. What this lesson is actually
about goes past this one more nested class: `SequenceNumber`'s own type
is a real, deliberate choice, not an obvious one — a real Mastercam
operation's own numbering (`10`, `20`, `30`, ...) looks arithmetic, but
carries a real, physical reason for the gaps between each value, and
choosing the right C# type here means understanding what that number is
actually *for*, not just what it looks like.

**What you need to know first.** Lesson 17 — `NcFile`, and the exact
`List<T>`-based composition pattern this lesson reapplies, one level
deeper in this project's own domain model, for the identical reason
already given there.

**Terms used in this lesson.** None new — this lesson reapplies
constructs (a plain class with auto-implemented properties, a `List<T>`
property with an initializer) already fully explained in earlier lessons.

**Objects and methods used.**

- **`Operation`**
  - *What it is:* this project's third domain object — a typed
    representation of one machining operation within an NC program.
  - *Implementation:* `public class Operation` in the
    `MastercamGenerator` namespace — the same plain-class shape, for the
    same reason, as `Part` and `NcFile`: real, editable application
    state.
  - *Its use:* the element type of `NcFile.Operations` (below) — every
    NC program this application represents is really a sequence of
    individual operations.
  - *Type:* a public class, instantiated with `new Operation()`.
  - *Responsibility:* holding one operation's own identifying number and
    description.
  - *Depends on:* nothing beyond being constructed.
  - *Connects to:* held, zero or more at a time, inside `NcFile.
    Operations`.
  - *Shape:* the third level of this project's own growing object graph
    — `Part` holds `NcFile`s, and now each `NcFile` holds `Operation`s.
- **`Operation.SequenceNumber`**
  - *What it is:* the property holding one operation's own real,
    Mastercam-assigned number.
  - *Implementation:* `public int SequenceNumber { get; set; }` — an
    **auto-implemented property** (already fully explained), this time
    with no initializer at all: `int` is a value type, and every value
    type already has a real, well-defined default (`0`) the compiler
    guarantees automatically — unlike a `string` property (a reference
    type), which needed an explicit `= "";"` in an earlier lesson
    specifically to avoid a real compiler warning about a potentially
    unset, non-nullable reference.
  - *Its use:* identifying which specific operation this is, and, in
    practice, its real position within an NC program's own execution
    order.
  - *Type:* an instance property.
  - *Responsibility:* holding this one operation's own real, assigned
    number — not necessarily contiguous with its neighbors.
  - *Depends on:* nothing beyond the containing `Operation` existing.
  - *Connects to:* read by anything that needs to know an operation's own
    identity or order; not yet compared or sorted by anything in this
    project.
  - *Shape:* a genuinely different kind of number than anything counted
    so far in this project (a files-found total, a retry-attempt index)
    — this one is a real, physical identifier a machinist assigns
    deliberately, not a count this program itself produces.
- **`NcFile.Operations`**
  - *What it is:* the new property on `NcFile` holding every `Operation`
    belonging to it.
  - *Implementation:* `public List<Operation> Operations { get; set; } =
    new List<Operation>();` — the identical pattern, applied one level
    deeper, as an earlier lesson's own `Part.NcFiles`.
  - *Its use:* the actual mechanism giving `NcFile` real internal
    structure — one program, many operations.
  - *Type:* a public instance property.
  - *Responsibility:* holding an ordered collection of this specific NC
    program's own `Operation`s.
  - *Depends on:* nothing beyond the containing `NcFile` existing.
  - *Connects to:* filled in, eventually, by a real parser; read by
    whatever future code needs to know a program's own operations.
  - *Shape:* the object graph an earlier lesson started, now three levels
    deep: `Part` → `NcFile` → `Operation`.

---

## Concept Unit: A New Domain Class — `Operation`, With a Real Number

### The Problem

Nothing in this project can represent a single machining operation —
`NcFile` (an earlier lesson) holds a program's own identity, but a real
NC program is really a sequence of individual operations, each with its
own real, assigned number.

> A real Mastercam program's operations are typically numbered `10`,
> `20`, `30`, and so on — not `1`, `2`, `3`. If these numbers were purely
> a count this program itself generated, gaps of exactly `10` between
> every single one would be a strange coincidence. What real, practical
> reason might a machinist have for leaving room between consecutive
> operation numbers, rather than numbering them with no gaps at all?

### Introduce the Concept in Isolation

No new isolated example — this lesson's own Header already states no new
syntax appears in it; `Operation`'s own declaration reapplies an
already-isolated pattern (an earlier lesson's own auto-implemented
property, with and without an initializer) rather than introducing
anything new to demonstrate separately.

### Discard the Throwaway Example

Not applicable — no new throwaway example was written for this unit.

### Project Change

- **Reference Source** — no reference counterpart. `Operation`'s own two
  fields match this curriculum's own outline and the real
  `OPERATION`/`DESCRIPTION` shape an earlier lesson's own sample XML
  file already showed real examples of (`"Face Mill Top"`, `"Drill
  Holes"`).
- **Files affected** — created: `Operation.cs`, in the
  `MastercamGenerator/` project folder.
- **Change type** — add (a brand-new file).
- **Location** — n/a; the start of a new file.
- **Dependencies** — none beyond the project itself already existing.

### The New Code

```csharp
namespace MastercamGenerator;

public class Operation
{
    public int SequenceNumber { get; set; }
    public string Description { get; set; } = "";
}
```

### The Updated Project

This *is* the whole new structure — a brand-new file with nothing
surrounding it yet — so there is nothing further to return to.

### Mechanical Walkthrough

1. `namespace MastercamGenerator;` and `public class Operation` — the
   same **namespace** and **`class`** declaration pattern (both already
   fully explained) as every other domain class in this project.
2. `public int SequenceNumber { get; set; }` — an **auto-implemented
   property** (already fully explained) of type `int`, with no
   initializer: `int` is a value type, and a value-typed property with no
   initializer and no constructor assignment defaults automatically to
   `0` — a real, guaranteed value, not an absence of one, and not
   something this project's own `<Nullable>enable</Nullable>` setting has
   any opinion about, since that setting (already fully explained)
   concerns reference types specifically.
3. `public string Description { get; set; } = "";` — an
   auto-implemented `string` property with an **auto-property
   initializer** (already fully explained), the identical pattern
   already used for every other `string` property in this project's
   domain model, for the identical reason.

### CS Lens

Choosing `int` for `SequenceNumber` — a real, physical identifier, not a
count this program computes — is a small but real instance of matching a
type to what a value actually *represents*, not just what it superficially
looks like. A `SequenceNumber` and, say, an earlier lesson's own
`discoveredFiles.Count` are both `int`s, but they mean fundamentally
different things: one is assigned once, by a person, and never
recalculated; the other is derived, fresh, every time, from whatever a
collection currently contains. Also recognized in: a Social Security
number and a bank balance, both stored as numbers, one assigned once and
never recomputed, the other recalculated with every transaction; a
product's model number and its current inventory count, both integers,
serving entirely different roles; a house's street address number and
the number of houses on the street, easily confused as "just numbers" but
answering entirely different questions.

### SE Lens

Gaps of `10` between consecutive real operation numbers are a real,
deliberate machining convention, not an artifact of anything this
project's own code does: leaving room between `10` and `20` lets a
machinist insert a new operation — `15`, say — between two existing ones
later, without renumbering every operation that comes after it. This
project's own `int SequenceNumber` doesn't enforce, or even know about,
that convention at all — it simply stores whatever real number a real
setup sheet reports, gaps and all, which is exactly the right amount of
involvement: the *convention* belongs to real-world machining practice,
not to this application's own domain model, and baking an assumption like
"operations are always numbered in exact multiples of ten" into this
class would be a real, unforced constraint this project has no actual
need to impose.

### Commands Needed

None — this lesson's own class needs no real build to confirm; every
construct it uses is already fully proven, stable, ordinary C#.

### Run It

Stated with real confidence, not executed: an auto-implemented `int`
property with no initializer defaulting to `0` is foundational,
thoroughly documented C# behavior, with no genuine uncertainty for a real
run to resolve.

### Connecting Back

`Operation` now exists as a real, working class, entirely on its own. The
next Concept Unit gives `NcFile` a real way to hold many of them.

---

## Concept Unit: Composition — Giving `NcFile` a Collection of `Operation`s

### The Problem

`NcFile` (an earlier lesson) and `Operation` (this lesson's own previous
Concept Unit) exist independently. A real NC program is genuinely made up
of several operations, in sequence — nothing about `NcFile`'s own two
flat fields can represent that yet.

### Introduce the Concept in Isolation

No new isolated example — a `List<T>`-typed property with an initializer
is the identical combination an earlier lesson's own `Part.NcFiles`
already proved in full, one level up in this same object graph.

### Discard the Throwaway Example

Not applicable — no new throwaway example was written for this unit.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — modified: `NcFile.cs`.
- **Change type** — add (one new property).
- **Location** — inside `NcFile`, alongside its existing two properties.
- **Dependencies** — an earlier lesson's own `NcFile` and this lesson's
  own `Operation`.

### The New Code

```csharp
public List<Operation> Operations { get; set; } = new List<Operation>();
```

### The Updated Project

The full `NcFile.cs`, with the new property marked:

```csharp
1  namespace MastercamGenerator;
2  
3  public class NcFile
4  {
5      public string ProgramName { get; set; } = "";
6      public string ProgramNumber { get; set; } = "";
7      public List<Operation> Operations { get; set; } = new List<Operation>();  // ← new
8  }
```

`NcFile` now has real internal structure of its own: two flat facts,
exactly as an earlier lesson left them, plus a genuine collection of its
own `Operation`s.

### Mechanical Walkthrough

1. `public List<Operation> Operations { get; set; } = new
   List<Operation>();` — an **auto-implemented property** of type
   `List<Operation>` (a **generic type**, already fully explained, as a
   category), with an **auto-property initializer** constructing a real,
   empty list immediately — the identical pattern an earlier lesson's own
   `Part.NcFiles` already established, `Operation` filling in the type
   argument this time instead of `NcFile`.

### CS Lens

This is the identical **object graph** idea an earlier lesson already
named for `Part.NcFiles`, extended one level deeper: `Part` holds
`NcFile`s, and now each `NcFile` holds `Operation`s — a real
**parent/child relationship**, in one direction only: an `Operation`
here has no property pointing back to the `NcFile` it belongs to, the
same way an `NcFile` has no property pointing back to its own `Part`.
Also recognized in: a company's org chart again, extended one level —
each employee object might itself manage a further team, with no
requirement that every employee also hold a direct reference back up to
their own manager; a book's table of contents listing chapters, each
listing its own sections, with no section needing to know which chapter
it belongs to in order to exist.

### SE Lens

The alternative — giving `Operation` its own `NcFile` property, pointing
back to whichever `NcFile` contains it, so code holding just an
`Operation` could still reach its parent — was available, and is a real,
legitimate design some object graphs do use. It's not chosen here because
nothing in this project's own current requirements ever needs to go
*from* an operation *up* to its program — every real use so far
(assembling the graph, eventually parsing into it) already starts from
`Part` and works downward. Adding a back-reference nothing currently
needs would be the same premature-complexity mistake an earlier lesson's
own CS Lens already named for `Part`'s properties — real, avoidable
complexity (and, with true parent/child pointers in both directions, a
real risk of circular references complicating anything that ever needs
to print or serialize this graph) paid for a capability nothing yet
requires.

### Commands Needed

None — this lesson's own change needs no real build to confirm; every
construct it uses is already fully proven, stable, ordinary C#.

### Run It

Stated with real confidence, not executed: an auto-implemented
`List<Operation>` property with an inline initializer is a direct
repetition of an already-proven pattern, with no genuine uncertainty for
a real run to resolve.

### Connecting Back

`NcFile` now has real internal structure, matching `Part`'s own one level
up. This project's object graph is now three levels deep, with one more
domain object — `Tool`, a later lesson's own subject — still to come
before a real parser connects any of it to actual XML.

---

## Connect the Pieces

Extend this curriculum's own earlier hand-built example one level deeper,
using only constructs already proven in this lesson and the one before
it:

```csharp
var part = new Part();
part.PartNumber = "10234-B";

var firstProgram = new NcFile();
firstProgram.ProgramName = "Program1001";
part.NcFiles.Add(firstProgram);

var firstOperation = new Operation();
firstOperation.SequenceNumber = 10;
firstOperation.Description = "Face Mill Top";
firstProgram.Operations.Add(firstOperation);

var secondOperation = new Operation();
secondOperation.SequenceNumber = 20;
secondOperation.Description = "Drill Holes";
firstProgram.Operations.Add(secondOperation);
```

1. `part` and `firstProgram` are built exactly as an earlier lesson
   already established, connected via `part.NcFiles.Add(firstProgram)`.
2. Two real `Operation`s (this lesson's own first Concept Unit) are
   constructed, each with a real `SequenceNumber` — `10`, then `20`,
   with the real, deliberate gap this lesson's own SE Lens already
   explained — and appended to `firstProgram.Operations` (this lesson's
   own second Concept Unit), using `List<T>.Add` (already fully
   explained), the identical mechanism already proven one level up in
   this same graph.
3. The complete object graph now runs three levels deep: one `Part`,
   holding one `NcFile`, holding two `Operation`s, each independently
   identifiable and correctly ordered by its own real `SequenceNumber` —
   the exact shape this curriculum's own outline described, built by
   hand, before any parser exists to build it from real data.

`Tool` — the object a real operation actually uses, and this curriculum's
own next domain-model lesson — is still missing from this graph
entirely. Nothing here yet represents *what* either operation actually
does with a real cutting tool; that's this curriculum's next lesson.
