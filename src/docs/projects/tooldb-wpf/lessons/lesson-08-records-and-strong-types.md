# Lesson 8: Locking Data Down Once It's Correct

**What you will build.** `ToolDB`'s own `Tool` type — the class `Tool.FromReader`
has built one of, once per database row, since Lesson 4 — stops being an
ordinary mutable `class` and becomes a `record`, with every property changed
from `set` to `init`. Nothing about what the app *does* changes: the same
rows come back, the same JSON still crosses into the browser pane. What
changes is what's true about a `Tool` object once it exists: right now,
anything holding a reference to one of Lesson 4's `Tool` objects can reach in
and silently change any field, at any time, with no record of it happening —
including two different variables that both think they own their own private
copy, but don't. The transferable problem underneath the feature: **who is
allowed to change this data, and when** is a real design decision every
object-oriented language forces you to make, whether you make it on purpose
or not — and C# gives you a specific, compiler-enforced way to say "this data
is only ever set once, at construction, and never again."

**What you need to know first.** Lesson 4 — `class`, `Tool`, its five
auto-implemented properties, and `Tool.FromReader(SqliteDataReader)` as a
`static` factory method. Lesson 7 — `List<Tool>`, `JsonSerializer.Serialize`,
and the exact JSON shape this project's real `tools.db` row produces.

**Terms used in this lesson**

- **reference type** — a category of C# type (every `class`, including
  `Tool` since Lesson 4) where a variable of that type doesn't hold the
  object itself — it holds a reference to where the real object lives on
  the heap. It exists because objects can be large, can be shared, and can
  outlive the single method call that created them; storing a reference
  instead of copying the whole object every time a variable is assigned is
  what makes that possible. This matters directly in this lesson because
  assigning one reference-type variable to another (`Widget alias =
  original;`) copies the *reference*, not the object it points to — both
  variables end up pointing at the exact same object.
- **aliasing** — the situation where two or more variables hold references
  to the same underlying object, rather than each having its own
  independent copy. It exists as a direct, unavoidable consequence of
  reference-type assignment (above) — nothing prevents it, and nothing
  warns you when it happens. This lesson's first Concept Unit exists to
  prove aliasing is real, not theoretical, using this project's own
  `Widget` type.
- **value semantics** — a way for a type to define equality and behave
  such that two separately-constructed instances holding the same data are
  treated as equivalent, in contrast to reference semantics (comparing
  whether two variables point to the literal same object in memory). It
  exists because sometimes "the same data" is what a program actually
  cares about, not "the same object" — a database row read twice should
  arguably be treated as the same logical `Tool`, even though it's two
  separate `Tool` objects in memory, one per read.
- **domain model** — the set of types a program uses to represent the
  real-world concepts it deals with — here, `Tool`, representing one real
  physical cutting tool a machinist would recognize. It exists as a name
  for "the types that are *about* the problem," distinct from types that
  exist only for technical plumbing (a database connection, a JSON string)
  — `Tool` is this project's domain model; `SqliteConnection` is not.
- **`record`** — reappearing as a language keyword throughout this lesson
  once introduced — a modifier placed on a type declaration (`record Tool`
  instead of `class Tool`) that tells the compiler to generate several
  extra members automatically: value-based `Equals`, `GetHashCode`, `==`,
  `!=`, and `ToString`. It exists because writing all of those by hand,
  correctly, for every data-holding type in a program is repetitive and
  easy to get subtly wrong — the compiler already knows every property a
  type declares, so it can generate correct versions of all five without
  a human re-deriving them for each new type.
- **`init` accessor** — reappearing throughout this lesson once
  introduced — a property accessor, written in place of `set`, that only
  permits assignment during object construction (inside an object
  initializer, or inside the type's own constructor) and refuses it at
  any later point. It exists to let a property be set once, using the
  same familiar object-initializer syntax `set` already supports, while
  still making the property genuinely unchangeable afterward — something
  a plain `get`-only property can't do without giving up object-initializer
  syntax entirely and forcing a constructor instead.

**Objects and methods used**

- **`System.Object.Equals(object? obj)`**
  - *What it is:* the method every C# type inherits by default, used to
    ask "are these two things equal?" — called either directly
    (`a.Equals(b)`) or indirectly, by other code that needs to compare
    objects (collections, `==`, test assertions).
  - *Implementation:* `public virtual bool Equals(object? obj);`
    (Microsoft's own reference, fetched this session), declared on
    `System.Object`, the base type every C# class ultimately derives from.
    Its own documented Remarks state plainly, for the reference-type case
    this lesson's first two Concept Units both exercise: "If the current
    instance is a reference type, the `Equals(Object)` method tests for
    reference equality, and a call to the `Equals(Object)` method is
    equivalent to a call to the `ReferenceEquals` method. Reference
    equality means that the object variables that are compared refer to
    the same object." Its own inheritance table is equally direct: for "a
    class derived directly from `Object`" — every ordinary `class` this
    project has written, `Tool` and `Widget` included, before this
    lesson — the default behavior is "Reference equality; equivalent to
    calling `Object.ReferenceEquals`."
  - *Its use:* called, both directly and via `==` (Terms, above — the
    operator itself), on `PlainPoint` and `PointRecord` instances in this
    lesson's second Concept Unit, to prove — not assert — that a plain
    `class` and a `record` answer "are these equal?" differently by
    default.
  - *Type:* an instance method, declared `virtual` — meaning any derived
    type, including a `record`, is permitted to override it with its own
    implementation, which is exactly what a `record` type does
    automatically.
  - *Responsibility:* decide whether the current object and another given
    object should be treated as equal — the single method every other
    equality-dependent piece of .NET (dictionaries, `HashSet<T>`, test
    assertion libraries) ultimately calls to answer that question, unless
    a type overrides it with different behavior.
  - *Depends on:* the object it's called on (`this`), and one parameter,
    the object being compared against — nothing else.
  - *Connects to:* called by this lesson's own lab code directly
    (`p1.Equals(p2)`); also the real method `==` compiles down to, for any
    type that hasn't overridden `operator ==` itself — which is exactly
    what distinguishes `PlainPoint`'s behavior from `PointRecord`'s in
    this lesson's second Concept Unit.
  - *Shape:* a framework-defined contract every C# type participates in
    whether it explicitly opts in or not — the default, inherited
    behavior for `Tool` through Lesson 7, and the exact behavior a
    `record`'s compiler-synthesized override replaces it with.
- **`System.Object.ToString()`**
  - *What it is:* the method every C# type inherits by default, used to
    produce a human-readable text representation of an object — called
    directly, or implicitly whenever an object is interpolated into a
    string (`$"{r1}"`, used in this lesson's second Concept Unit) or
    passed to `Console.WriteLine`.
  - *Implementation:* `public virtual string ToString();` (Microsoft's own
    reference, fetched this session). Its own Remarks state the default
    behavior plainly: "Default implementations of the `Object.ToString`
    method return the fully qualified name of the object's type" — its
    own worked example shows a plain, unoverridden reference type printing
    only its own type name (`Examples.Object1`), not any of its data.
  - *Its use:* called implicitly, via string interpolation, on `r1`
    (`PointRecord`) in this lesson's second Concept Unit — chosen
    specifically because a `record`'s own compiler-generated override of
    this exact method is what makes the difference from the default
    behavior observable.
  - *Type:* an instance method, declared `virtual` — the same overridable
    shape as `Equals`, above.
  - *Responsibility:* produce a string representation of the object,
    suitable for display or debugging — the single method .NET's own
    string-formatting machinery (string interpolation, `Console.WriteLine`,
    a debugger's own variable inspector) calls whenever an object needs to
    become text, unless a type overrides it with different behavior.
  - *Depends on:* the object it's called on (`this`) — no parameters.
  - *Connects to:* called implicitly by string interpolation
    (`$"...{r1}..."`) and by `Console.WriteLine` wherever an object,
    rather than an already-built string, is passed in.
  - *Shape:* the same kind of framework-defined, always-present contract
    as `Equals`, above — inherited and left at its default, uninformative
    behavior for `Tool` through Lesson 7, replaced by a `record`'s own
    compiler-synthesized override starting this lesson.

**Everything else in the file, not this lesson's own subject but still
explained**

- **`SqliteConnection`, `SqliteCommand`, `SqliteDataReader`, `.Open()`,
  `.ExecuteReader()`, `.Read()`**
  - *What it is:* reappearing from Lessons 1–7 — the same
    connection/query/cursor sequence this project has used every lesson
    since Lesson 1.
  - *Implementation:* established in Lessons 1–2, unchanged.
  - *Its use:* still opens `tools.db` and runs the same `SELECT`,
    unaffected by this lesson's change to `Tool` itself.
- **`Tool.FromReader(SqliteDataReader)`**
  - *What it is:* reappearing from Lesson 4 — this project's own
    user-defined factory method, mapping one database row into one `Tool`
    object.
  - *Implementation:* established in Lesson 4 — a `static` method, called
    on the type itself rather than an instance, returning a `new Tool`
    built via object-initializer syntax.
  - *Its use:* its own body does not change at all in this lesson — this
    is the whole point of choosing `init` (Terms, above) over some other
    fix: object-initializer syntax (`new Tool { Id = ..., Name = ... }`)
    works identically whether each property is declared `set` or `init`;
    only what's *possible after* that one call changes.
- **`List<Tool>`, `List<T>.Add`, `List<T>.Count`, the `List<T>` indexer**
  - *What it is:* reappearing from Lesson 7 — the growable collection
    holding every row read from `tools.db`.
  - *Implementation:* established in Lesson 7, unchanged.
  - *Its use:* still built and read the same way in `MainWindow_Loaded`;
    nothing about `List<Tool>` itself changes because its element type
    changed from a `class` to a `record` — `List<T>` works identically for
    both.
- **`JsonSerializer.Serialize<TValue>`**
  - *What it is:* reappearing from Lesson 7 — the method converting
    `tools` into the JSON string that eventually crosses into the browser
    pane.
  - *Implementation:* established in Lesson 7, unchanged.
  - *Its use:* this lesson's own second Concept Unit proves, with real
    output, that converting `Tool` from a `class` to a `record` does not
    change what this call produces — the same property values, serialized
    the same way, because `JsonSerializer` reads properties through their
    `get` accessor, and `init` changes nothing about `get`.

---

## Concept Unit: A Shared Reference Is Not a Shared Copy

### The Problem

Every `Tool` object this project has built since Lesson 4 is a `class`
instance — a reference type (Terms, above). Nothing in this project has
ever tested what that actually means once two different pieces of code
both hold a reference to what looks like "the same data." If one part of a
future feature reads a `Tool` from the list and changes a field on it —
maybe to build a modified copy for display — does the original entry in
`tools` change too, or not?

> **Try this first:** `Widget`, this project's own small stand-in type
> from Lesson 7, has a settable `Name` property, same as `Tool` did through
> Lesson 7. If you write `Widget alias = original;` where `original` is an
> existing `Widget` object — does `alias` get its own independent copy of
> `original`'s data, or something else? Think back to Lesson 7's own
> `List<T>` explanation: a `List<Tool>` was chosen specifically because it
> holds *references* to `Tool` objects, not the objects' data directly —
> does plain variable assignment (`=`) behave any differently?

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `LabScratch/Program.cs`, replaced entirely (this
  project's own established convention for this file — see this lesson's
  Closing note on what happened to Lesson 7's own prior content).
- **Change type** — add (throwaway lab code only; no change to `ToolDB`
  itself in this unit).
- **Location** — top-level statements, before any type declaration in the
  file (the same `CS8803` ordering rule Lesson 4 already established still
  applies).
- **Dependencies** — `Widget`, the small `class` Lesson 7 already defined
  in this same file, reused here unchanged.

### The New Code

```csharp
Widget original = new Widget { Name = "1/2 in 4-Flute Carbide End Mill", Count = 1 };
Widget alias = original;
alias.Name = "RENAMED BY MISTAKE";
```

### The Updated Project

This is new, freestanding top-level code with nothing existing to place it
inside — per this schema's own rule, a brand-new statement sequence has
nothing to locate a position *within* yet. The next unit shows exactly
where in the finished `LabScratch/Program.cs` this lands.

### Proving It in Isolation

The code above already *is* the isolated lab — three lines, nothing else,
using `Widget`, a type this project has already met and knows the full
shape of. Printing both variables afterward is what actually proves the
claim:

```csharp
Console.WriteLine($"original.Name = {original.Name}");
Console.WriteLine($"alias.Name = {alias.Name}");
```

Run, from `LabScratch/`:

```
dotnet run
```

Real output, captured this session:

```
original.Name = RENAMED BY MISTAKE
alias.Name = RENAMED BY MISTAKE
```

This is the proof: `alias.Name = "RENAMED BY MISTAKE";` only ever mentions
`alias` — nothing in that line names `original` at all — and yet
`original.Name` changed too. This is called **aliasing** (Terms, above):
`original` and `alias` were never two independent `Widget` objects: `Widget
alias = original;` copied the *reference* stored in `original`, not the
`Widget` object it points to, so both variable names end up pointing at the
literal same object on the heap. Changing "it" through either name changes
the one and only object both names refer to.

### Discard the Throwaway Example

`original` and `alias`, and the `Console.WriteLine` calls proving their
aliasing, are discarded here — they exist only to prove reference-type
assignment behaves this way, and do not become part of `ToolDB`.

### Mechanical Walkthrough

- `Widget original = new Widget { Name = "1/2 in 4-Flute Carbide End Mill", Count = 1 };`
  — `Widget` (reappearing from Lesson 7, a plain `class` with settable
  `Name`/`Count` properties), constructed with `new` and an object
  initializer (reappearing from Lesson 4) — nothing new in this line by
  itself; it exists only to give the next line something real to alias.
- `Widget alias = original;` — an ordinary variable declaration and
  assignment, the same syntax used for `int`, `string`, or any other
  variable since Lesson 1 — but its *effect* here is the actual new
  concept: because `Widget` is a **reference type** (Terms, above), the
  value actually stored in the `original` variable was never the object
  itself — it was a reference to where that object lives. Assigning
  `original` to `alias` copies that reference, the same as copying an
  address copies the address, not the building it points to. After this
  line, `original` and `alias` are two different variable names holding
  the exact same reference — they are **aliased** (Terms, above).
- `alias.Name = "RENAMED BY MISTAKE";` — an ordinary property assignment,
  the same `set` accessor mechanism `Widget.Name` has always had since
  Lesson 7 — the new part is *which object* this mutates: because `alias`
  and `original` share a reference, this line doesn't just change "what
  `alias` points to has a new name" — it changes the one shared `Widget`
  object itself, and every reference to that object, `original` included,
  sees the change.

### CS Lens

The distinction this unit just proved — does assigning a variable copy the
*data*, or copy a *reference* to shared data — is called **reference
semantics** (contrasted with **value semantics**, this lesson's own next
Concept Unit). It is not a C#-specific idea. Also recognized in: Python
(assigning one variable holding a `list` to another aliases the same list —
`b = a; b.append(1)` changes `a` too), Java (every non-primitive type
behaves exactly like C#'s reference types here), JavaScript (objects and
arrays alias the same way; only primitives like numbers and strings don't),
and, more generally, any system where multiple pointers can reference one
shared piece of mutable memory — the exact same category of bug that can
occur in C or C++ with two raw pointers to the same allocation.

### SE Lens

Why does C# default to reference semantics for `class` types at all, rather
than always copying? The alternative not chosen — copying an entire object's
data every time a variable is assigned or passed to a method — was
deliberately rejected by C#'s own designers for `class` types specifically
because copying can be expensive (a large object, copied every time it's
passed to a function, wastes both time and memory) and because sharing is
often exactly what's wanted (two parts of a program that are supposed to see
the same, single, up-to-date `Tool` benefit from aliasing, not lose from it).
The honest cost this project has been silently carrying since Lesson 4,
without ever naming it until this unit: nothing about `Tool`'s own shape
prevented this exact aliasing bug from happening to real tool data — two
variables both referencing what looks like "a `Tool`" could diverge from
what a reader expects, or one could be mutated in a way that silently
corrupts what the other believes is still the original, unmodified row read
from `tools.db`. This lesson's remaining two units are the direct fix.

### Run It

Already run above, real output captured and shown.

### Connecting Back

This unit proved reference semantics is real, using `Widget`, a type this
project already understood — but did *not* yet involve `Tool` at all, and
did not touch `ToolDB` itself. The next unit introduces the actual language
feature — `record` — that changes how *equality* is judged for a type; the
unit after that is where `Tool` itself finally changes, closing the
aliasing gap this unit just proved is real.

---

## Concept Unit: Judging Equality by Data, Not by Identity — `record`

### The Problem

`System.Object.Equals` (Header, above) — inherited by every `class` this
project has ever written, `Tool` and `Widget` both — judges equality by
asking "are these two variables pointing at the literal same object?," per
its own documented Remarks. That is a perfectly reasonable default, but it
means two separately-read `Tool` objects representing the exact same real
row — same `Id`, same `Name`, same everything — are judged *not equal*,
because they're two different objects in memory, one per read. Before
changing `Tool` itself, this project needs to see, concretely, that a
different answer is possible.

> **Try this first:** If `Object.Equals`'s own documented default is
> "reference equality" for every `class` — as this lesson's Header quotes
> directly — what would you expect `p1 == p2` to print for two separately
> constructed `PlainPoint` objects holding the identical `X`/`Y` values?
> Now, given this lesson's own Terms already named `record` as a keyword
> that generates *value-based* equality automatically — what would you
> expect to change if the exact same two values were held by a `record`
> instead of a `class`?

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `LabScratch/Program.cs`, extended (appended after
  the previous unit's aliasing code, per this project's own established
  convention of keeping each session's lab work in this file rather than
  deleting it).
- **Change type** — add (two new throwaway type declarations, and new
  top-level statements exercising them).
- **Location** — the two new type declarations join `Widget` at the bottom
  of the file, after all top-level statements; the new statements exercising
  them join the existing top-level statement sequence, after the previous
  unit's aliasing code.
- **Dependencies** — none beyond what's already in the file.

### The New Code

Two small, otherwise-identical types — one a `class`, one a `record` — so
only the keyword differs:

```csharp
class PlainPoint
{
    public int X { get; set; }
    public int Y { get; set; }
}

record PointRecord
{
    public int X { get; init; }
    public int Y { get; init; }
}
```

### The Updated Project

`LabScratch/Program.cs`'s type-declaration section, in full, new lines
marked (`Widget` and `Tool` are this file's own existing declarations from
Lesson 7, shown here unchanged so the two new types are seen in their real
context, not floating on their own):

```csharp
 1  class Widget
 2  {
 3      public string Name { get; set; } = "";
 4      public int Count { get; set; }
 5  }
 6
 7  record Tool
 8  {
 9      public int Id { get; init; }
10      public string Name { get; init; } = "";
11      public string Manufacturer { get; init; } = "";
12      public double OverallDiameter { get; init; }
13      public double OverallLength { get; init; }
14      public int FluteCount { get; init; }
15
16      public static Tool FromReader(SqliteDataReader reader)
17      {
18          return new Tool
19          {
20              Id = reader.GetInt32(0),
21              Name = reader.GetString(1),
22              Manufacturer = reader.GetString(2),
23              OverallDiameter = reader.GetDouble(3),
24              OverallLength = reader.GetDouble(4),
25              FluteCount = reader.GetInt32(5)
26          };
27      }
28  }
29
30  class PlainPoint                                                    // ← new
31  {                                                                   // ← new
32      public int X { get; set; }                                     // ← new
33      public int Y { get; set; }                                     // ← new
34  }                                                                   // ← new
35
36  record PointRecord                                                  // ← new
37  {                                                                   // ← new
38      public int X { get; init; }                                    // ← new
39      public int Y { get; init; }                                    // ← new
40  }                                                                   // ← new
```

Lines 7–28 already show this lesson's real target — `LabScratch`'s own local
copy of `Tool`, kept in sync with `ToolDB/Tool.cs` per this project's own
established convention for this file — already written as a `record` with
`init` properties (this unit's own lab is what proves that choice is
correct, immediately below, before the next unit ever touches the real
`ToolDB/Tool.cs` file itself). Lines 30–40 are this unit's own new,
unrelated pair — small enough to isolate the one concept this unit is
actually about, equality, with no database, no JSON, and no aliasing
involved at all.

### Proving It in Isolation

Two variables of each type, holding identical data, compared both by `==`
and by `.Equals`:

```csharp
PlainPoint p1 = new PlainPoint { X = 3, Y = 4 };
PlainPoint p2 = new PlainPoint { X = 3, Y = 4 };
Console.WriteLine($"p1 == p2 (class): {p1 == p2}");
Console.WriteLine($"p1.Equals(p2) (class): {p1.Equals(p2)}");

PointRecord r1 = new PointRecord { X = 3, Y = 4 };
PointRecord r2 = new PointRecord { X = 3, Y = 4 };
Console.WriteLine($"r1 == r2 (record): {r1 == r2}");
Console.WriteLine($"r1.Equals(r2) (record): {r1.Equals(r2)}");
Console.WriteLine($"r1.ToString() = {r1}");
```

Run, from `LabScratch/`:

```
dotnet run
```

Real output, captured this session:

```
p1 == p2 (class): False
p1.Equals(p2) (class): False
r1 == r2 (record): True
r1.Equals(r2) (record): True
r1.ToString() = PointRecord { X = 3, Y = 4 }
```

This is the proof: `p1` and `p2` hold identical `X`/`Y` values, constructed
completely separately — not aliased, per the previous unit's own proven
distinction — and `PlainPoint`'s inherited `Object.Equals` (Header, above)
still reports them unequal, exactly matching its own documented default
("Reference equality... equivalent to calling `Object.ReferenceEquals`").
`r1` and `r2`, same values, same separate construction, report *equal* on
both `==` and `.Equals` — this is called **value equality** (Terms, above,
under **value semantics**), and it comes from `record` alone; nothing in
`PointRecord`'s own declaration mentions `Equals` at all. The last line
proves a second, separate thing `record` generates for free: `r1.ToString()`
did not print `PointRecord` alone (which is what `Object.ToString`'s own
documented default — "the fully qualified name of the object's type" —
would produce) — it printed every property and its value,
`PointRecord { X = 3, Y = 4 }`, confirmed directly against Microsoft's own
documentation for this exact synthesized format (fetched this session):
"`<record type name> { <property name> = <value>, <property name> =
<value>, ...}`."

### Discard the Throwaway Example

`PlainPoint`, `PointRecord`, `p1`, `p2`, `r1`, and `r2` are discarded here —
real proof of `record`'s own compiler-synthesized behavior, never part of
`ToolDB` itself.

### Mechanical Walkthrough

- `class PlainPoint { public int X { get; set; } public int Y { get; set; } }`
  — an ordinary `class` declaration (established since Lesson 4), two
  ordinary auto-implemented properties with `set` (established since
  Lesson 4) — nothing new here by itself; it exists to be the control case
  this unit's real comparison is measured against.
- `record PointRecord { ... }` — the **`record`** keyword (Terms, above),
  used here for the first time in this project. Placed where `class` would
  ordinarily go in a type declaration, it tells the compiler to generate
  four extra members automatically for `PointRecord`: an override of
  `Object.Equals(object?)` that compares every declared property's value
  instead of comparing references; a matching override of
  `Object.GetHashCode()` (not directly exercised in this lesson's own
  output, but required to keep `Equals` and hash-based collections like
  `Dictionary<TKey,TValue>` consistent with each other); overrides of the
  `==` and `!=` operators that call the new `Equals`; and an override of
  `Object.ToString()` that prints every declared property and its current
  value. Microsoft's own documentation, fetched this session, confirms this
  set exactly: "the compiler synthesizes several methods, including... An
  override of `Object.Equals(Object)`... An override of
  `Object.GetHashCode()`... Overrides of operator `==` and operator `!=`."
- `public int X { get; init; }` — the **`init` accessor** (Terms, above),
  used here for the first time in this project, in place of the `set`
  `PlainPoint.X` uses one line above it. Syntactically, this looks like a
  tiny, one-word change; its actual effect — locking the property against
  any assignment after construction — is this lesson's own next unit's
  entire subject, deliberately isolated here from `record`'s own separate
  effect (equality/`ToString`) so the two concepts don't get proven
  together and mistaken for one thing.
- `PlainPoint p1 = new PlainPoint { X = 3, Y = 4 };` and
  `PlainPoint p2 = new PlainPoint { X = 3, Y = 4 };` — two separate `new`
  calls (established since Lesson 1) with object-initializer syntax
  (established since Lesson 4) — the deliberate point is that these are
  *two different objects*, unlike the previous unit's aliased `original`/
  `alias`, so any difference in how they compare traces to `class` vs.
  `record`, not to aliasing.
- `p1 == p2` — the `==` operator (reappearing — already used on primitives
  like `int` and `bool` since Lesson 1, used here for the first time on a
  user-defined type). For an ordinary `class` that hasn't overridden it,
  `==` compiles down to a call to `Object.Equals` (Header, above; also
  confirmed directly by `PlainPoint`'s own real, matching output line, one
  line below) — reference equality.
- `p1.Equals(p2)` — `Object.Equals(object? obj)` (Header, above), called
  directly rather than through `==`, to prove both spellings agree: `p1`
  and `p2` are unequal by both measures, because `PlainPoint` never
  overrides either one.
- `r1 == r2`, `r1.Equals(r2)` — the same two calls, on `PointRecord`
  instead — now resolving to the compiler-synthesized overrides `record`
  (above) generated instead of `PlainPoint`'s inherited defaults, which is
  exactly why the real output differs.
- `r1.ToString()` (via string interpolation, `$"...{r1}"`) — `record`'s
  own synthesized override of `Object.ToString()` (Header, above),
  confirmed by this unit's own real output to follow Microsoft's exact
  documented format.

### CS Lens

Judging two things equal because their *contents* match, rather than
because they're the literal same instance, is called **value semantics**
(Terms, above) — a concept far broader than this one C# keyword. Also
recognized in: Python's own tuples and `dataclass`es with `eq=True` (the
default), two strings in most languages (`"abc" == "abc"` is almost always
true by content, even for two separately-built string objects), mathematics
itself (the fraction 1/2 and the fraction 2/4 are considered the *same
number*, even though they're written differently), and database rows
compared by their actual column values rather than by internal row ID.

### SE Lens

Why does C# require an explicit `record` keyword to opt into this, rather
than making every `class` compare by value automatically? The alternative
not chosen — value equality by default for all reference types — was
rejected because reference equality is frequently the *correct* choice: a
`Window` object, a database `Connection`, or anything representing a live,
stateful resource shouldn't suddenly be considered "equal" to a different
instance just because its fields happen to currently hold the same values —
identity, not content, is what actually matters for those. `record` exists
specifically for the opposite case: data-centric types, like `Tool`, whose
entire purpose is to *represent* a value, where two instances holding the
same data really are interchangeable. The honest cost accepted here: value
equality (and the `GetHashCode` it depends on) only stays correct if every
property actually participates — Microsoft's own documentation on
inheritance hierarchies (not directly exercised by this lesson's own flat,
non-inherited `Tool`, but worth knowing) notes that a derived record's
equality also checks the *runtime type*, not just the properties — a detail
this project doesn't need yet, since `Tool` has no subtypes, but is real,
documented behavior worth being aware exists.

### Run It

Already run above, real output captured and shown.

### Connecting Back

This unit proved, with real values and real output, exactly what `record`
adds over a plain `class`: value-based `Equals`/`==`/`GetHashCode`, and a
real `ToString`. It used two throwaway types, `PlainPoint` and
`PointRecord`, deliberately kept far away from `Tool` itself. The next unit
is where this stops being a lab exercise and becomes the real project:
`ToolDB/Tool.cs` itself changes from `class` to `record`, with every
property changed from `set` to `init` — closing the very aliasing gap the
first unit in this lesson proved was real.

---

## Concept Unit: Closing the Gap — `Tool` Becomes a `record`

### The Problem

The first unit in this lesson proved reference-type aliasing is real, using
`Widget`. The second proved `record` changes how equality and `ToString`
work, using two throwaway types built purely to demonstrate it. Neither
unit has touched the real project yet. `ToolDB/Tool.cs` — the actual type
`Tool.FromReader` builds one of per database row, the actual type
`MainWindow_Loaded` puts into a `List<Tool>` and serializes to JSON — is
still exactly what Lesson 4 left it: an ordinary `class`, with `set` on
every property, fully exposed to the same aliasing risk this lesson's first
unit proved is real, not hypothetical.

> **Try this first:** Given everything the previous two units already
> proved — that `record` changes equality/`ToString`, and that `init`
> (mentioned, not yet proven) replaces `set` — what do you expect happens
> to `Tool.FromReader`'s own body, which builds every `Tool` using object-
> initializer syntax (`new Tool { Id = ..., Name = ..., ... }`)? Does that
> method need to change at all, or does object-initializer syntax already
> work the same way whether a property is declared with `set` or `init`?

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/Tool.cs`, modified.
- **Change type** — replace (the `class` keyword becomes `record`; every
  property's `set` accessor becomes `init`).
- **Location** — the type declaration line, and each of the six property
  declarations directly beneath it; `Tool.FromReader`'s own method body is
  untouched.
- **Dependencies** — none new; this change depends only on `Tool.cs`'s own
  existing shape from Lesson 4.

### The New Code

The type declaration and its six properties — the only lines that change:

```csharp
public record Tool
{
    public int Id { get; init; }
    public string Name { get; init; } = "";
    public string Manufacturer { get; init; } = "";
    public double OverallDiameter { get; init; }
    public double OverallLength { get; init; }
    public int FluteCount { get; init; }
```

### The Updated Project

`ToolDB/Tool.cs`, in full, changed lines marked — `FromReader`'s own body
(lines 12–23) is shown here unchanged, exactly as it was in Lesson 4, to
directly answer this unit's own Socratic question above:

```csharp
 1  using Microsoft.Data.Sqlite;
 2
 3  public record Tool                                                  // ← changed
 4  {
 5      public int Id { get; init; }                                    // ← changed
 6      public string Name { get; init; } = "";                         // ← changed
 7      public string Manufacturer { get; init; } = "";                 // ← changed
 8      public double OverallDiameter { get; init; }                    // ← changed
 9      public double OverallLength { get; init; }                      // ← changed
10      public int FluteCount { get; init; }                            // ← changed
11
12      public static Tool FromReader(SqliteDataReader reader)
13      {
14          return new Tool
15          {
16              Id = reader.GetInt32(0),
17              Name = reader.GetString(1),
18              Manufacturer = reader.GetString(2),
19              OverallDiameter = reader.GetDouble(3),
20              OverallLength = reader.GetDouble(4),
21              FluteCount = reader.GetInt32(5)
22          };
23      }
24  }
```

The answer to this unit's own Socratic question is now visible directly:
lines 12–23, `FromReader`'s entire body, needed zero changes. `new Tool {
Id = reader.GetInt32(0), ... }` is still ordinary object-initializer syntax
— per this lesson's own Header, an `init` accessor "enables calling code to
use an object initializer to set the initial value," the exact same syntax
a `set` accessor already permitted. What changed is only what's possible
*after* this method returns: a `Tool` returned from `FromReader` can no
longer have any of its six properties reassigned, by any code, anywhere in
the project, ever again.

### Proving It in Isolation

This unit's own change is small enough that the real project change
*is* the proof of the positive case — `Tool.FromReader` still builds a real
`Tool` correctly. What still needs proving is the negative case: does
`init` actually *refuse* a later assignment, the way this lesson's Header
claims, or does it silently allow one? A deliberate, temporary line, added
to `LabScratch/Program.cs`, directly after this file's own real read of
`tools.db`:

```csharp
tools[0].Name = "Renamed after the fact";
```

Built, from `LabScratch/`:

```
dotnet build
```

Real output, captured this session, with this line present:

```
C:\...\LabScratch\Program.cs(28,1): error CS8852: Init-only property or indexer 'Tool.Name' can only be assigned in an object initializer, or on 'this' or 'base' in an instance constructor or an 'init' accessor.

Build FAILED.
```

This is the proof, and it's a stronger one than a runtime check would be:
this is a **compile-time** error — `CS8852` — meaning the mistake this line
represents can never even reach a running program at all; the build itself
refuses to produce one. This directly closes this lesson's first Concept
Unit's own aliasing gap: the previous unit's aliasing bug worked *because*
`Widget.Name` had a `set` accessor, letting `alias.Name = "..."` compile
and run without complaint, silently corrupting `original` too. The
identical line, attempted against a `record` with `init`-only properties,
never compiles at all.

### Discard the Throwaway Example

The `tools[0].Name = "Renamed after the fact";` line is removed from
`LabScratch/Program.cs` immediately after capturing the real error above —
it exists only to prove `init` refuses a later assignment, and was never
meant to build successfully, let alone become part of `ToolDB`.

### Mechanical Walkthrough

- `public record Tool` — the **`record`** keyword (Header and previous
  unit, above), applied here for the first time to this project's own real
  domain model (Terms, above) rather than a throwaway lab type. Everything
  the previous unit proved about `record` — compiler-synthesized value
  equality, `GetHashCode`, `==`/`!=`, and `ToString` — now applies to every
  `Tool` object this project builds, including the one real row `tools.db`
  currently holds: two separate reads of that same row will now compare
  equal to each other, where before this lesson they would not have.
- `public int Id { get; init; }` (and the same pattern repeated for
  `Name`, `Manufacturer`, `OverallDiameter`, `OverallLength`, and
  `FluteCount`) — the **`init` accessor** (Header and previous unit,
  above), replacing `set` on all six properties. Per Microsoft's own
  documentation, quoted in full in this lesson's Header, this permits
  `Tool.FromReader`'s own object-initializer syntax to keep working exactly
  as before, while refusing any assignment attempted after that
  construction finishes — proven directly, above, by the real `CS8852`
  error a later assignment now produces.
- `new Tool { Id = reader.GetInt32(0), ... }` inside `FromReader` —
  reappearing unchanged from Lesson 4; object-initializer syntax
  (established since Lesson 4), still valid because, per this lesson's own
  Header quote of Microsoft's documentation, "an `init` accessor enables
  calling code to use an object initializer to set the initial value" —
  the identical permission a `set` accessor already granted.

### CS Lens

Restricting when a piece of data is allowed to change — here, "only during
construction, never after" — is a specific instance of a broader idea
called **immutability**. Also recognized in: Python's own `tuple` (fixed
once created, unlike a `list`), Java's `final` fields, JavaScript's
`Object.freeze`, and functional programming languages generally (Haskell,
Elixir), where *every* value is immutable by default and "changing" a value
always means producing a new one instead — the exact idea C# records extend
with their own `with` expression (named directly in Microsoft's own
documentation, fetched this session, though not yet used by this project;
worth knowing the name for when a future lesson needs a modified copy of an
existing, otherwise-locked `Tool`).

### SE Lens

Why lock `Tool` down at all, rather than leaving every property freely
settable, the way it's been since Lesson 4? The alternative not chosen —
leaving `set` in place — costs nothing to write, but this lesson's own
first Concept Unit already proved, concretely, what it risks: any code
anywhere in a growing project, now or in some future lesson, holding a
reference to a `Tool` object can silently mutate data another part of the
program still believes is the original, unmodified database row — with no
compiler warning, and no way to know it happened after the fact. `init`
trades that risk for a real, if narrow, cost: if a genuine future need
arises to build a "modified copy" of an existing `Tool` — say, showing a
what-if edited version before saving it back to `tools.db` — the fix isn't
reassigning a property anymore; it requires building a whole new `Tool`
(or, per this lesson's own CS Lens, a record's own `with` expression) from
the original's values. That's a real, honest constraint this project is
now committed to, not a cost-free choice — accepted specifically because
`Tool` represents a database row, and a database row silently drifting out
of sync with what's actually on disk is a strictly worse failure mode than
having to construct a new object on purpose when a real change is intended.

### Commands Needed

None new — `dotnet build`, run above, is the same command this project has
used since Lesson 0.

### Run It

Already run above (the ordinary build, showing 0 Warnings/0 Errors on the
real project change) — repeated here for a second, separate purpose: this
project's existing automated test still passes against the now-record
`Tool`. Run, from `ToolDB.Tests/`:

```
dotnet test
```

Real output, captured this session:

```
Passed!  - Failed:     0, Passed:     1, Skipped:     0, Total:     1, Duration: 218 ms - ToolDB.Tests.dll (net9.0)
```

`ToolTests.cs`'s own single `[Fact]`, established in Lesson 4, only ever
*reads* `Tool`'s properties (`tool.Id`, `tool.Name`, and so on) to assert
against expected values — it never assigns to any of them after
construction — so converting `Tool` from `class` to `record` with `init`
changes nothing about what this test does or asserts; it passing again,
unchanged, is itself confirmation that this lesson's change is purely
additive restriction, not a behavior change to anything already working.

### Connecting Back

`Tool` is now exactly what this lesson's own Header opened by naming: a
`record`, with every property `init`-only. Every `Tool` object `FromReader`
has ever built, and every one it builds from this point forward, is now
genuinely locked once constructed — this lesson's first Concept Unit's own
aliasing bug, reproduced against `Tool` instead of `Widget`, would no
longer even compile, let alone run and silently corrupt data.

---

## Connect the Pieces

One concrete trace, start to finish, through everything this lesson built:

1. `Widget original = new Widget { Name = "1/2 in 4-Flute Carbide End Mill", Count = 1 };`
   followed by `Widget alias = original; alias.Name = "RENAMED BY MISTAKE";`
   proved, with real output, that reference-type assignment shares one
   object between two names — mutating through either one is visible
   through both (Unit 1).
2. `class PlainPoint` and `record PointRecord`, built with identical data,
   proved — again with real output, not assumed — that a plain `class`
   answers "are these equal?" by asking "is this the same object?" (`False`
   for two separately-built, identically-valued instances), while a
   `record` answers it by asking "do these hold the same values?" (`True`)
   — and that a `record` also gets a real, data-showing `ToString` for free
   (Unit 2).
3. `ToolDB/Tool.cs` itself changed: `class Tool` became `record Tool`, and
   every `set` became `init` — `Tool.FromReader`'s own body, unchanged
   since Lesson 4, kept working exactly as before, because object-
   initializer syntax never distinguished `set` from `init` in the first
   place (Unit 3).
4. The real, deliberate proof that this actually closes Unit 1's own gap:
   `tools[0].Name = "Renamed after the fact";`, the exact same shape of
   mistake as Unit 1's `alias.Name = "RENAMED BY MISTAKE";`, now fails to
   even *compile* — a real `CS8852` error, captured directly, not
   predicted — where the identical mistake against `Widget` compiled,
   ran, and silently corrupted a second variable's data without any
   warning at all (Unit 3).
5. `ToolDB`'s existing test suite, and a normal `dotnet build`, both still
   pass, unchanged — proving this lesson's entire change is additive
   restriction only: every one of `tools.db`'s real rows still reads,
   still serializes to the exact same JSON shape Lesson 7 already proved,
   and still reaches the browser pane exactly as before. What's different
   is not what `Tool` can do — it's what it can no longer have done to it
   by mistake.

**A housekeeping note, not a curriculum decision:** this session's
environment had only .NET SDKs 7 through 9 installed, not the .NET 10 SDK
this project's four `.csproj` files were previously targeting — every
project (`ToolDB`, `ToolDB.Tests`, `LabScratch`, `LabScratch.Wpf`) was
retargeted from `net10.0`/`net10.0-windows` to `net9.0`/`net9.0-windows`
this session so real verification could happen at all; nothing about this
lesson's own taught concepts depends on which of those two versions is
targeted. `tools.db` itself was also found empty (0 bytes) at the start of
this session — expected, not a bug, since `*.db` files are `.gitignore`d
and never travel with the repository itself — and was recreated with the
exact schema and single row Lessons 2–3 already established, before any of
this lesson's own verification ran.

**Next lesson:** 9 — Multiple Tables & `JOIN` (categories/vendors, foreign
keys).
