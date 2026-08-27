# Lesson 19: One Child, Not Many — Building `Tool` and `Assembly`

**What you will build.** Two new domain classes — `Tool` (`Number`,
`Description`, `Comment`, and its own `Assembly`) and `Assembly`
(`Holder`) — plus a `Tool` property on `Operation`, completing the exact
typed domain model this curriculum's own outline has been building since
`Part`. What this lesson is actually about goes past these two more
classes: every nested domain object this project has built so far —
`Part.NcFiles`, `NcFile.Operations` — has been a *collection*, because a
part genuinely has many programs and a program genuinely has many
operations. `Operation.Tool`, this lesson's own closing piece, is
different: one operation uses exactly one tool. Composition doesn't
always mean "a list of children" — sometimes it means exactly one, and
this lesson is the first place this project's domain model has to
represent that real, singular relationship correctly.

**What you need to know first.** Lesson 18 — `Operation`, the class this
lesson gives a new property to. Lesson 5 — this project's own real,
generated implicit-usings list, confirmed there to exclude `System.IO`;
this lesson checks that same real list again for a different namespace,
`System.Reflection`, for a genuinely new reason.

**Terms used in this lesson.** None new — this lesson reapplies
constructs (a plain class with auto-implemented properties, a
class-typed property with an initializer) already fully explained in
earlier lessons, applied to a new situation.

**Objects and methods used.**

- **`Tool`**
  - *What it is:* this project's fourth domain object — a typed
    representation of one cutting tool used by an operation.
  - *Implementation:* `public class Tool` in the `MastercamGenerator`
    namespace — the same plain-class shape, for the same reason, as
    `Part`, `NcFile`, and `Operation`.
  - *Its use:* the type of `Operation.Tool` (below) — every operation
    this application represents uses exactly one real tool.
  - *Type:* a public class, instantiated with `new Tool()`.
  - *Responsibility:* holding one tool's own identifying number,
    description, comment, and its own nested `Assembly`.
  - *Depends on:* nothing beyond being constructed.
  - *Connects to:* held, exactly one at a time, inside `Operation.Tool`.
  - *Shape:* the fourth level of this project's own object graph — and
    the first one this lesson gives a *singular* child of its own,
    `Assembly`, rather than a collection.
- **`Assembly`**
  - *What it is:* this project's fifth domain object — a typed
    representation of a tool's own physical holder assembly.
  - *Implementation:* `public class Assembly` in the
    `MastercamGenerator` namespace. Its name is identical, by pure
    coincidence, to the unrelated `System.Reflection.Assembly` (a real
    .NET class representing a loaded, compiled unit of code) — real,
    verified proof that this doesn't cause a genuine naming conflict in
    this specific project comes from an earlier lesson's own inspection
    of this project's real, generated implicit-usings list, which does
    not include `System.Reflection` at all; nothing in this file makes
    the unqualified name `Assembly` ambiguous.
  - *Its use:* the type of `Tool.Assembly` (below).
  - *Type:* a public class, instantiated with `new Assembly()`.
  - *Responsibility:* holding a tool's own holder information.
  - *Depends on:* nothing beyond being constructed.
  - *Connects to:* held, exactly one at a time, inside `Tool.Assembly`.
  - *Shape:* the fifth and, for now, deepest level of this project's own
    object graph.
- **`Tool.Assembly`**
  - *What it is:* the property on `Tool` holding its own single
    `Assembly`.
  - *Implementation:* `public Assembly Assembly { get; set; } = new
    Assembly();` — an **auto-implemented property** (already fully
    explained) of a class type, this time initialized to a real,
    constructed instance rather than an empty collection or an empty
    string — the identical *reason* as both of those: this project's own
    `<Nullable>enable</Nullable>` setting would otherwise warn about a
    non-nullable reference-typed property with no guaranteed value.
  - *Its use:* the actual mechanism connecting a `Tool` to its own
    holder, one-to-one, not one-to-many.
  - *Type:* a public instance property.
  - *Responsibility:* holding exactly one `Assembly` — never zero, never
    more than one.
  - *Depends on:* nothing beyond the containing `Tool` existing.
  - *Connects to:* filled in, eventually, by a real parser; read by
    whatever future code needs a tool's own holder information.
  - *Shape:* a singular composition relationship — the same underlying
    idea as `Part.NcFiles`, but holding exactly one object directly,
    rather than a collection capable of holding any number.
- **`Operation.Tool`**
  - *What it is:* the new property on `Operation` holding the one real
    tool it uses.
  - *Implementation:* `public Tool Tool { get; set; } = new Tool();` —
    the identical singular-composition pattern as `Tool.Assembly`, one
    level up in this project's own object graph.
  - *Its use:* completing the real relationship this curriculum's own
    outline has been building toward — an operation, using a tool, whose
    tool has a holder.
  - *Type:* a public instance property.
  - *Responsibility:* holding the one real tool this specific operation
    actually uses.
  - *Depends on:* nothing beyond the containing `Operation` existing.
  - *Connects to:* filled in, eventually, by a real parser; read by
    whatever future code needs to know which tool an operation uses.
  - *Shape:* the completed shape this entire domain-model phase has been
    building toward: `Part` → `NcFile` → `Operation` → `Tool` →
    `Assembly`, five real levels deep.

---

## Concept Unit: A New Domain Class — `Tool`

### The Problem

Nothing in this project can represent a single cutting tool — an
`Operation` (an earlier lesson) records what work happens and in what
order, but not what physical tool actually performs it.

### Introduce the Concept in Isolation

No new isolated example — this lesson's own Header already states no new
syntax appears in this unit; `Tool`'s own declaration reapplies an
already-isolated pattern from earlier lessons.

### Discard the Throwaway Example

Not applicable — no new throwaway example was written for this unit.

### Project Change

- **Reference Source** — `brd.md`'s own Architecture Overview: "typed
  representation of a parsed Setup Sheet (root metadata, `NcFile` list,
  `Operation`, `Tool` with nested `Assembly`/`Holder`)."
- **Files affected** — created: `Tool.cs`, in the `MastercamGenerator/`
  project folder.
- **Change type** — add (a brand-new file).
- **Location** — n/a; the start of a new file.
- **Dependencies** — none beyond the project itself already existing.

### The New Code

```csharp
namespace MastercamGenerator;

public class Tool
{
    public int Number { get; set; }
    public string Description { get; set; } = "";
    public string Comment { get; set; } = "";
}
```

### The Updated Project

This *is* the whole new structure so far — `Tool.Assembly` is this
lesson's own next Concept Unit, added to this same file.

### Mechanical Walkthrough

1. `namespace MastercamGenerator;` and `public class Tool` — the same
   **namespace** and **`class`** declaration pattern (both already fully
   explained) as every other domain class in this project.
2. `public int Number { get; set; }` — an **auto-implemented property**
   of type `int`, with no initializer — the identical reasoning an
   earlier lesson's own `Operation.SequenceNumber` already established:
   value types default automatically, with no warning.
3. `public string Description { get; set; } = "";` and `public string
   Comment { get; set; } = "";` — two `string` properties with **auto-
   property initializers**, the identical pattern used throughout this
   project's own domain model.

### CS Lens

Nothing new to name here beyond what earlier lessons already covered in
full for `Part`, `NcFile`, and `Operation` — this unit's own point is
recognizing the identical reasoning applies a fourth time, not a new
construct.

### SE Lens

The alternative — giving `Tool` a `Holder` property directly, skipping a
separate `Assembly` class entirely, since this lesson's own real sample
data only ever shows one holder per tool — was available, and would be
fewer lines today. It's not chosen because `brd.md` itself explicitly
names `Assembly` as its own real, separate concept, nested inside `Tool`
— a real machining assembly can, in principle, carry more information
than just a holder name (this project's own outline names only `Holder`
for now, but the real domain concept is broader), and collapsing it into
`Tool` directly would make a later, real need to add more assembly-level
detail a breaking change to `Tool` itself, rather than an addition to a
class already scoped for exactly that purpose.

### Commands Needed

None — this lesson's own class needs no real build to confirm.

### Run It

Stated with real confidence, not executed: this unit's own code reapplies
already-proven constructs, with no genuine uncertainty for a real run to
resolve.

### Connecting Back

`Tool` now exists with its own three flat facts. The next Concept Unit
gives it a real `Assembly` of its own.

---

## Concept Unit: A Nested `Assembly`, and a Real Naming Collision

### The Problem

`Tool` needs its own holder information, per `brd.md`'s own explicit
architecture — but nothing in this project can represent an assembly yet,
and this lesson's own chosen name for that new class, `Assembly`, is not
actually a new name in .NET at all.

> `System.Reflection.Assembly` is a real, existing .NET class,
> representing a loaded, compiled unit of code — a `.dll` or `.exe` file,
> at runtime. This lesson's own new class is also named `Assembly`, and
> means something else entirely — a machining tool's holder assembly. If
> this project's own code never writes `using System.Reflection;`
> anywhere, does that name collision actually cause a real problem, or
> does it simply never come up?

### Introduce the Concept in Isolation

No new isolated example — this unit's own real answer comes from
checking an already-established, real fact about this project, not from
a new throwaway demonstration.

### Discard the Throwaway Example

Not applicable — this unit checks a real, already-known fact rather than
introducing new code to isolate.

### Project Change

- **Reference Source** — `brd.md`'s own Architecture Overview, the same
  sentence cited in this lesson's previous Concept Unit, naming
  `Assembly`/`Holder` explicitly.
- **Files affected** — modified: `Tool.cs`.
- **Change type** — add (a new class, `Assembly`, and a new property on
  `Tool`).
- **Location** — a new class in the same file as `Tool`, and one new
  property inside `Tool` itself.
- **Dependencies** — this lesson's previous Concept Unit's `Tool` class.

### The New Code

```csharp
public class Assembly
{
    public string Holder { get; set; } = "";
}
```

```csharp
public Assembly Assembly { get; set; } = new Assembly();
```

### The Updated Project

The full `Tool.cs`, with the new class and property marked:

```csharp
1  namespace MastercamGenerator;
2  
3  public class Tool
4  {
5      public int Number { get; set; }
6      public string Description { get; set; } = "";
7      public string Comment { get; set; } = "";
8      public Assembly Assembly { get; set; } = new Assembly();  // ← new
9  }
10 
11 public class Assembly                                        // ← new
12 {                                                              // ← new
13     public string Holder { get; set; } = "";                  // ← new
14 }                                                              // ← new
```

`Tool` now has a real, nested `Assembly` of its own, never `null`,
alongside its three flat facts from this lesson's previous Concept Unit.

### Mechanical Walkthrough

1. `public class Assembly { public string Holder { get; set; } = ""; }`
   — a plain **`class`** (already fully explained) with one `string`
   **auto-implemented property** and **auto-property initializer** (both
   already fully explained) — the identical shape as every other domain
   class in this project.
2. `public Assembly Assembly { get; set; } = new Assembly();` — an
   **auto-implemented property** on `Tool`, of type `Assembly` (this
   unit's own new class), initialized with `new Assembly()` — the
   identical reasoning as an earlier lesson's own `Part.NcFiles = new
   List<NcFile>();`: a reference-typed property needs a real, guaranteed
   value at construction, or this project's own nullable-reference-types
   setting would flag it as potentially unset. Note the property's name,
   `Assembly`, and its type, also `Assembly` — legal, unambiguous C#: a
   property can share its own exact name with its own type, since one is
   a member name and the other is a type name, resolved in entirely
   separate ways by the compiler.

### CS Lens

Two unrelated real-world domains — machining (a tool's physical holder
assembly) and .NET's own runtime (a compiled code module) — independently
arriving at the identical word, "assembly," for two entirely different
concepts, is a real, ordinary fact about naming in software: names are
local to whatever vocabulary defines them, and a name colliding across
two unrelated domains is not automatically a real conflict — it only
becomes one if both meanings are ever needed, unqualified, in the exact
same scope. Also recognized in: "driver" meaning both a person operating
a vehicle and a piece of software controlling hardware; "cell" meaning
both a biological unit and a spreadsheet's single addressable box;
"table" meaning both a piece of furniture and a database's own row-and-
column structure — none of these collide in practice, because the
contexts that use each meaning essentially never need the other one at
the same time.

### SE Lens

The alternative — naming this project's own class something collision-
avoiding, like `ToolAssembly` or `HolderAssembly`, specifically to steer
clear of `System.Reflection.Assembly`'s name — was available, and is a
real, legitimate defensive habit some codebases adopt. It's not chosen
here because `brd.md` itself already settled on the plain domain term,
"Assembly," and this project has no real, current use for `System.
Reflection.Assembly` anywhere — inventing a more defensive name to guard
against a collision that doesn't actually occur would be solving a
problem this project doesn't have, the same over-caution an earlier
lesson's own YAGNI reasoning already argued against, applied here to
naming instead of structure.

### Commands Needed

None — this lesson's own change needs no real build to confirm.

### Run It

Stated with real confidence, not executed: this unit's core claim — that
`System.Reflection` is not part of this project's own implicit usings —
is not new information; it was already directly confirmed by an earlier
lesson's own real, inspected `MastercamGenerator.GlobalUsings.g.cs`
(`System`, `System.Collections.Generic`, `System.Linq`, `System.Threading`,
`System.Threading.Tasks` — no `System.Reflection` anywhere in that real,
generated list), and nothing about this lesson's own new code changes
that file at all.

### Connecting Back

`Tool` is now complete, with a real, nested `Assembly` of its own. The
final Concept Unit connects `Tool` to `Operation`, completing this
curriculum's own entire domain-model phase.

---

## Concept Unit: Composition — Giving `Operation` a `Tool`

### The Problem

`Operation` (an earlier lesson) and `Tool` (this lesson's own previous
two Concept Units) exist independently. A real operation genuinely uses
exactly one real tool — nothing about `Operation`'s own two flat fields
can represent that.

> Every earlier composition in this project's own domain model —
> `Part.NcFiles`, `NcFile.Operations` — used a `List<T>`, because a part
> genuinely has many programs, and a program genuinely has many
> operations. Does an operation have *many* tools, the same way, or
> exactly one?

### Introduce the Concept in Isolation

No new isolated example — a class-typed property with an initializer,
holding exactly one nested object rather than a collection, is the
identical pattern this lesson's own previous Concept Unit already proved
in full, for `Tool.Assembly`.

### Discard the Throwaway Example

Not applicable — no new throwaway example was written for this unit.

### Project Change

- **Reference Source** — no reference counterpart for this specific
  property; `brd.md`'s own architecture overview names `Tool` as a
  member of the typed domain model without specifying exactly which
  other object holds a reference to it — this lesson makes that one
  specific placement decision deliberately, matching the one-tool-per-
  operation relationship this project's own real sample setup sheet's
  own `OPERATION`/`TOOL` nesting already shows.
- **Files affected** — modified: `Operation.cs`.
- **Change type** — add (one new property).
- **Location** — inside `Operation`, alongside its existing two
  properties.
- **Dependencies** — an earlier lesson's own `Operation` and this
  lesson's own `Tool`.

### The New Code

```csharp
public Tool Tool { get; set; } = new Tool();
```

### The Updated Project

The full `Operation.cs`, with the new property marked:

```csharp
1  namespace MastercamGenerator;
2  
3  public class Operation
4  {
5      public int SequenceNumber { get; set; }
6      public string Description { get; set; } = "";
7      public Tool Tool { get; set; } = new Tool();  // ← new
8  }
```

`Operation` now holds a real, complete `Tool` of its own, never `null` —
completing the five-level object graph this curriculum's own domain-
model phase set out to build: `Part` → `NcFile` → `Operation` → `Tool` →
`Assembly`.

### Mechanical Walkthrough

1. `public Tool Tool { get; set; } = new Tool();` — an **auto-
   implemented property**, of type `Tool`, initialized with `new Tool()`
   — the identical singular-composition pattern this lesson's own
   previous Concept Unit already established for `Tool.Assembly`, one
   level up in this same object graph. As with `Assembly`/`Assembly`,
   the property's name and its type share the identical word, `Tool`,
   legally and unambiguously.

### CS Lens

This completes a real, five-level **object graph** (already fully
explained, in an earlier lesson, as a category) mixing both shapes this
project's domain model actually needs: `Part.NcFiles` and `NcFile.
Operations` are one-to-many, because a part really does have several
programs and a program really does have several operations; `Tool.
Assembly` and `Operation.Tool` are one-to-one, because a tool really has
exactly one holder assembly, and an operation really uses exactly one
tool. A domain model that forced every relationship into the same
shape — every child a collection, or every child exactly one — would be
lying about at least one of these real, physical facts.

### SE Lens

A real question this unit's own design deliberately leaves open: the real
sample XML file (an earlier lesson's own subject) has `TOOL` elements
both nested inside `OPERATION` *and* listed again, separately, directly
under `NCFILE` — the same real duplication that lesson's own
`Elements()`/`Descendants()` distinction exists to handle. This lesson
wires only `Operation.Tool`, matching what this curriculum's own outline
explicitly asks for here — it does not add a second, summary `NcFile.
Tools` collection for the duplicate list, since nothing in this lesson's
own requirements calls for it yet. Whether a real parser (a later
lesson's own responsibility) needs to populate a second collection like
that, or can get by re-deriving a tool list from each operation's own
`Tool` when needed, is a real decision that lesson gets to make with
actual parsing requirements in hand — not one to guess at and build
speculatively here.

### Commands Needed

None — this lesson's own change needs no real build to confirm.

### Run It

Stated with real confidence, not executed: this unit's own code reapplies
an already-proven pattern from earlier in this same lesson.

### Connecting Back

This project's entire typed domain model — `Part`, `NcFile`, `Operation`,
`Tool`, `Assembly` — now exists, matching `brd.md`'s own architecture
overview exactly. This curriculum's own Phase 5 is complete. Nothing in
any of it has been filled in by real data yet; that is the very next
lesson's entire job.

---

## Connect the Pieces

Extend this curriculum's own hand-built example to its full, real depth,
using only constructs already proven across this domain-model phase:

```csharp
var part = new Part();
part.PartNumber = "10234-B";

var program = new NcFile();
program.ProgramName = "Program1001";
part.NcFiles.Add(program);

var operation = new Operation();
operation.SequenceNumber = 10;
operation.Description = "Face Mill Top";
program.Operations.Add(operation);

operation.Tool.Number = 1;
operation.Tool.Description = "3 Inch Face Mill";
operation.Tool.Assembly.Holder = "CAT40 Face Mill Holder";
```

1. `part`, `program`, and `operation` are built and connected exactly as
   earlier lessons already established.
2. `operation.Tool` is already a real, non-null `Tool` — this lesson's
   own auto-property initializer already constructed one — so
   `operation.Tool.Number = 1;` and `operation.Tool.Description = "3 Inch
   Face Mill";` assign directly into it, with no separate construction
   step needed.
3. `operation.Tool.Assembly.Holder = "CAT40 Face Mill Holder";` reaches
   three levels deep in one statement — `operation`'s `Tool`, that
   `Tool`'s own `Assembly`, that `Assembly`'s own `Holder` — legal only
   because every one of those properties was already guaranteed non-null
   by its own auto-property initializer; if any one of them had defaulted
   to `null` instead, this exact line would throw a real
   `NullReferenceException` partway through.

This is the complete, real shape this curriculum's own entire
domain-model phase has been building toward — five real classes, two
real one-to-many relationships, two real one-to-one relationships, built
and connected entirely by hand. Nothing about it comes from a real
setup sheet yet. Turning a real `XDocument` into exactly this shape,
automatically, is this curriculum's very next lesson.
