# Lesson 7: Trusting a Name Instead of a Timestamp — Parsing the Date From the Filename

**What you will build.** A `FileDateParser` class that reads a date and
time directly out of a filename — this project's own naming convention,
`<Name>_yyyy-MM-dd_HHmm.xml`, the same shape this curriculum's own
mockups have used from the start (`SetupSheet_2026-08-26_0512.xml`) —
and honestly reports when a filename doesn't actually follow that shape,
rather than guessing. Wiring it into `NewestFileResolver` means "newest"
now means "the file whose *name* claims the latest date," not "the file
the filesystem most recently touched" — two genuinely different facts
that happened to agree in every example so far in this project, but
don't have to. What this lesson is actually about goes past parsing one
specific filename shape: a file's last-write timestamp (an earlier
lesson's own `FileInfo.LastWriteTime`) reflects a purely mechanical fact
— when a byte was last saved to disk — while a filename encodes whatever
a human, or another program, decided to put there — a genuinely different
kind of information, one this project has quietly been treating as
interchangeable with the other until now.

**What you need to know first.** Lesson 4 — `FileInfo.LastWriteTime`,
and the honest distinction this lesson draws against it: a filesystem
fact versus a filename's own, separately-encoded claim. Lesson 6 —
`NewestFileResolver.FindNewest`'s `MaxBy`-based implementation, which
this lesson changes internally without touching its public signature at
all, and the `IEnumerable<InputFile>` contract that makes that possible.

**Terms used in this lesson.**

- **`out` parameter** — a C# method parameter marked with the `out`
  keyword, used to let a method hand back more than one piece of
  information from a single call: its ordinary return value, plus one or
  more additional values written directly into variables the caller
  provides. A variable passed as an `out` argument doesn't need to be
  given a value beforehand — the method being called is required to
  assign it before returning, and the caller can read it immediately after
  the call, as if the method had somehow returned two things at once. It
  exists for exactly the situation this lesson's `TryParseExact` faces:
  reporting *both* "did this succeed" and, if so, "here is the actual
  parsed value" — a single ordinary return value could only carry one of
  those two facts, not both.
- **the Try-pattern** — a naming and signature convention used throughout
  .NET for operations that can fail in an entirely ordinary, expected way:
  a method named `TryDoSomething`, returning a `bool` (`true` for success,
  `false` for failure), with the actual result, when there is one, handed
  back through an **`out` parameter**. It exists as an alternative to two
  worse options: throwing an exception for a failure that isn't actually
  exceptional (parsing text a user or another program might legitimately
  get wrong is an expected, routine occurrence, not a bug), or returning a
  single nullable value that can't as cleanly distinguish "genuinely
  parsed to this value" from "failed, here's some default" when the parsed
  type itself could legitimately equal that default.

**Objects and methods used.**

- **`FileDateParser`**
  - *What it is:* this project's new class representing "something that
    knows this application's own filename convention, and can read a real
    date out of a name that follows it."
  - *Implementation:* `public class FileDateParser` in the
    `MastercamGenerator` namespace — no base class, the same plain-class
    shape every application-logic class in this project has used since an
    earlier lesson.
  - *Its use:* the new home for this project's one piece of genuinely
    domain-specific parsing knowledge — what this application's own
    filenames are supposed to look like — kept separate from
    `DirectoryScanner` (which only cares that a file exists and ends in
    `.xml`) and `NewestFileResolver` (which only cares which file wins).
  - *Type:* a public class, instantiated once, with `new`.
  - *Responsibility:* reading this application's specific
    `<Name>_yyyy-MM-dd_HHmm.xml` convention out of a filename, and
    reporting `null`, honestly, for any filename that doesn't actually
    follow it — never guessing, never throwing for an ordinary,
    anticipated mismatch.
  - *Depends on:* nothing beyond being constructed.
  - *Connects to:* constructed once by `NewestFileResolver`, called once
    per candidate file it's asked to evaluate.
  - *Shape:* a fourth real dependency boundary in this project — the one
    class that actually knows this application's own filename convention,
    by name, so nothing else in this project has to.
- **`FileDateParser.TryParseDate(string)`**
  - *What it is:* the one method `FileDateParser` exposes.
  - *Implementation:* `public DateTime? TryParseDate(string fileName)` —
    despite its `Try`-shaped name, this method itself doesn't follow the
    literal Try-pattern signature (Header above): rather than a `bool`
    return plus an `out DateTime`, it collapses both facts into a single
    **nullable value type** (`DateTime?`, already fully explained in an
    earlier lesson) — a real value on success, `null` on failure. Its own
    internal implementation, below, does use the literal Try-pattern, via
    `DateTime.TryParseExact`.
  - *Its use:* called once per file `NewestFileResolver` is deciding
    among.
  - *Type:* a public instance method.
  - *Responsibility:* returning a real, parsed date for a filename that
    matches this application's convention, and `null` for absolutely any
    filename that doesn't — malformed, unrelated, or simply a different
    shape entirely.
  - *Depends on:* nothing beyond a `fileName` string being passed in —
    notably, it does not require the file to actually exist on disk; it
    only looks at the name itself.
  - *Connects to:* called from `NewestFileResolver.FindNewest`, both to
    decide which files are valid candidates and, again, to compare them.
  - *Shape:* the one public entry point into this lesson's new class.
- **`System.IO.Path.GetFileNameWithoutExtension(string)`**
  - *What it is:* a method that strips both the directory portion and the
    file extension from a path, leaving just the bare name.
  - *Implementation:* a `static` method in the `System.IO.Path` class,
    taking one `string` and returning one `string`.
  - *Its use:* turns `"SetupSheet_2026-08-26_0512.xml"` into
    `"SetupSheet_2026-08-26_0512"` — removing the `.xml` this lesson's
    parsing logic has no use for.
  - *Type:* a `static` method, called through the class name, `Path.
    GetFileNameWithoutExtension(...)`, with no `Path` instance involved.
  - *Responsibility:* one specific, narrow string transformation —
    nothing about validating that the result is well-formed in any other
    way.
  - *Depends on:* nothing beyond a string argument — like `TryParseDate`
    above, it works on the text alone and never touches the real
    filesystem.
  - *Connects to:* called first, inside `TryParseDate`, before anything
    else happens.
  - *Shape:* the first, narrowest step in this lesson's whole parsing
    pipeline.
- **`string.Split(char)`**
  - *What it is:* the method that breaks a string into pieces wherever a
    given character appears, discarding the character itself.
  - *Implementation:* an instance method on `string`, returning a
    `string[]` (an **array**, already fully explained in an earlier
    lesson) — one element per piece found between separators.
  - *Its use:* splitting `"SetupSheet_2026-08-26_0512"` on `'_'` into
    three pieces: `"SetupSheet"`, `"2026-08-26"`, and `"0512"`.
  - *Type:* an instance method, called on the string being split.
  - *Responsibility:* dividing one string into an ordered collection of
    smaller strings, based purely on where a given character occurs.
  - *Depends on:* the string it's called on, and the separator character
    to split by.
  - *Connects to:* its result, an array, is read by index right after —
    the first real use, in this project, of indexing into an array
    directly rather than walking it with `foreach`.
  - *Shape:* the step that turns one opaque string into this lesson's own
    named, addressable pieces.
- **`DateTime.TryParseExact(string, string, IFormatProvider, DateTimeStyles, out DateTime)`**
  - *What it is:* the method that attempts to parse a string into a
    `DateTime`, according to one specific, exactly-stated format, without
    throwing an exception if the string doesn't match.
  - *Implementation:* a `static` method on `DateTime`, following the
    literal **Try-pattern** (Header above): it returns `bool` (`true` if
    parsing succeeded), and hands back the actual parsed value through its
    final parameter, an **`out` parameter** (Header above) of type
    `DateTime`.
  - *Its use:* the actual date-and-time parsing at the center of this
    entire lesson — turning `"2026-08-26_0512"` into a real `DateTime`,
    or reporting failure for anything that doesn't match.
  - *Type:* a `static` method, called through the class name, `DateTime.
    TryParseExact(...)`.
  - *Responsibility:* checking a string against one exact format
    (`"yyyy-MM-dd_HHmm"`, this lesson's own literal format string) and
    either producing the real `DateTime` it describes, or failing cleanly,
    reporting `false` rather than throwing.
  - *Depends on:* a format string stating exactly what shape the input is
    expected to have; a `CultureInfo` (below) stating how to interpret
    culture-sensitive details; a `DateTimeStyles` value (below) for
    additional parsing options.
  - *Connects to:* called once inside `TryParseDate`; its `out` result is
    what `TryParseDate` itself returns, wrapped as a nullable `DateTime?`.
  - *Shape:* this lesson's one call to genuinely fallible, format-strict
    parsing — everything before it in `TryParseDate` is preparing this
    call's input; everything after is interpreting its result.
- **`System.Globalization.CultureInfo.InvariantCulture`**
  - *What it is:* a fixed, culture-neutral set of formatting rules,
    independent of whatever locale a specific computer happens to be
    configured for.
  - *Implementation:* a `static` property on `CultureInfo`, returning a
    real, singleton `CultureInfo` instance.
  - *Its use:* passed to `TryParseExact` so this application's filename
    dates parse identically on every machine that ever runs it, regardless
    of that machine's own regional settings.
  - *Type:* a `static` property.
  - *Responsibility:* providing one fixed, predictable answer to
    culture-sensitive questions (what does a date separator look like,
    what does "August" mean) that would otherwise vary machine to machine.
  - *Depends on:* nothing — it's a fixed, unconfigurable constant.
  - *Connects to:* read once, passed straight into `TryParseExact`.
  - *Shape:* a small but real correctness detail: this filename convention
    is this application's own fixed format, not something that should
    parse differently depending on which computer happens to be running
    it.
- **`System.Globalization.DateTimeStyles.None`**
  - *What it is:* the "no special options" member of the `DateTimeStyles`
    enum, which otherwise controls things like whether to ignore
    surrounding whitespace.
  - *Implementation:* a member of a `[Flags]`-style enum (a category of
    enum whose values can be combined — not exercised by this lesson,
    which uses exactly one, unmodified value).
  - *Its use:* required by `TryParseExact`'s own signature, even though
    this lesson has no special parsing options to request.
  - *Type:* an enum member.
  - *Responsibility:* explicitly stating "no extra parsing leniency" —
    the input must match the format string exactly, character for
    character.
  - *Depends on:* nothing.
  - *Connects to:* passed into `TryParseExact` alongside `CultureInfo.
    InvariantCulture`.
  - *Shape:* a required argument this lesson passes its simplest possible
    legal value for, the same way an earlier lesson's `BrowseButton_Click`
    accepted a `RoutedEventArgs` parameter its own logic never read.
- **`Enumerable.Where<TSource>(IEnumerable<TSource>, Func<TSource,bool>)`**
  - *What it is:* the LINQ method that filters a sequence down to just the
    elements matching a given condition.
  - *Implementation:* a `static` extension method (already fully
    explained, as a category, in an earlier lesson's treatment of
    `OrderByDescending`), taking a **lambda expression** (already fully
    explained) that returns `true` or `false` for each element.
  - *Its use:* filtering `files` down to only those whose filename
    actually parses — this lesson's real, working version of the
    curriculum's own "valid?" decision point.
  - *Type:* a `static` extension method.
  - *Responsibility:* producing a new sequence containing only the
    elements for which the given lambda returned `true`, in their
    original order, with nothing else changed about them.
  - *Depends on:* a non-null `source` and predicate.
  - *Connects to:* called on `files`, inside `FindNewest`; its result
    flows straight into `MaxBy`, an already fully explained method from
    an earlier lesson, reused here unchanged except for which lambda it's
    given.
  - *Shape:* the one new LINQ method this lesson adds to the two an
    earlier lesson already introduced.

---

## Concept Unit: Splitting a Filename Into Named Pieces

### The Problem

A filename like `"SetupSheet_2026-08-26_0512.xml"` is, to this project so
far, just an opaque string — an earlier lesson's `InputFile.FileName`
holds it, but nothing has ever looked *inside* it. This project's own
naming convention encodes real information — a date, a time — that a
human reading the name can pick out instantly, but nothing in this
project's code can yet.

> If you were given the string `"SetupSheet_2026-08-26_0512.xml"` and told
> it always follows the shape `<Name>_<date>_<time>.xml`, what's the most
> direct way to pull out just the `<date>` and `<time>` portions — would
> you need anything more sophisticated than looking for the underscore
> characters that already separate them?

### Introduce the Concept in Isolation

Two small, uninvolved pieces, their behavior predictable with real
confidence — both are extremely well-established, thoroughly documented
.NET string operations, not compiler quirks needing fresh proof:

```csharp
string bare = Path.GetFileNameWithoutExtension("SetupSheet_2026-08-26_0512.xml");
```

`bare` ends up holding `"SetupSheet_2026-08-26_0512"` — the `.xml`
extension removed, nothing else changed.

```csharp
string[] pieces = "a_b_c".Split('_');
```

`pieces` ends up holding an **array** (already fully explained) of three
elements: `"a"`, `"b"`, `"c"`, in that order — `pieces[0]` reads `"a"`,
`pieces[1]` reads `"b"`, and `pieces[2]` reads `"c"`, the first time this
project has read an array element by its numeric position rather than
walking every element with `foreach`.

### Discard the Throwaway Example

Neither `bare` nor `pieces` appears in the real project — both existed
only to isolate `GetFileNameWithoutExtension` and `Split` separately,
before this lesson's real code (below) combines both for a real filename.
Discarded now.

### Project Change

- **Reference Source** — no reference counterpart. This application's own
  `<Name>_yyyy-MM-dd_HHmm.xml` naming convention is this curriculum's own
  invention, matching the shape already used in this curriculum's own UI
  mockups.
- **Files affected** — created: `FileDateParser.cs`, in the
  `MastercamGenerator/` project folder.
- **Change type** — add (a brand-new file).
- **Location** — n/a; the start of a new file.
- **Dependencies** — none beyond the project itself already existing.

### The New Code

```csharp
using System.IO;

namespace MastercamGenerator;

public class FileDateParser
{
    public DateTime? TryParseDate(string fileName)
    {
        string nameWithoutExtension = Path.GetFileNameWithoutExtension(fileName);
        string[] parts = nameWithoutExtension.Split('_');
    }
}
```

### The Updated Project

The full `FileDateParser.cs`, as it stands at the end of this Concept
Unit:

```csharp
1  using System.IO;
2  
3  namespace MastercamGenerator;
4  
5  public class FileDateParser
6  {
7      public DateTime? TryParseDate(string fileName)          // ← new
8      {                                                        // ← new
9          string nameWithoutExtension = Path.GetFileNameWithoutExtension(fileName);  // ← new
10         string[] parts = nameWithoutExtension.Split('_');    // ← new
11     }
12 }
```

This doesn't compile yet — a method declared to return `DateTime?` needs
a `return` on every path through it, and this one has none yet. That's
this lesson's next two Concept Units.

### Mechanical Walkthrough

1. `using System.IO;` — a **`using` directive** (already fully
   explained), bringing `Path` (below) into scope by its short name.
2. `public DateTime? TryParseDate(string fileName)` — a method
   declaration: `public` (an **access modifier**, already fully
   explained); `DateTime?` (a **nullable value type**, already fully
   explained) as the return type; the name `TryParseDate`; one parameter,
   `fileName`, of type `string`.
3. `string nameWithoutExtension = Path.GetFileNameWithoutExtension
   (fileName);` — calls **`Path.GetFileNameWithoutExtension(string)`**
   (Header above), storing its result in a new local variable.
4. `string[] parts = nameWithoutExtension.Split('_');` — calls
   **`string.Split(char)`** (Header above) on `nameWithoutExtension`,
   with the literal character `'_'` as the separator, storing the
   resulting **array** (already fully explained) in `parts`.

### CS Lens

Breaking one string into smaller, individually meaningful pieces is
**tokenization** — a foundational parsing idea, present anywhere raw text
needs to become structured, addressable data before anything else useful
can be done with it. Also recognized in: a CSV file reader splitting each
line on commas before treating any value as a real number or date; a web
browser splitting a URL into its scheme, host, and path before acting on
any of them individually; a compiler's lexer breaking source code into
keywords, identifiers, and punctuation before a parser ever looks at their
meaning; a phone number formatter splitting a string of digits into area
code, exchange, and line number groups.

### SE Lens

The alternative — a regular expression matching the entire filename
pattern in one shot — was available, and is a genuinely common real-world
choice for exactly this kind of problem. Splitting on a fixed delimiter
instead is chosen here because this project's naming convention is
simple enough (three parts, one fixed separator) that a regular
expression's extra power — optional groups, repetition, alternation, none
of which this convention needs — would cost more to read and verify than
it would save; reaching for a regular expression makes more sense once a
convention grows complex enough to actually need that power.

### Commands Needed

None yet beyond `dotnet build`, run once for this lesson's whole batch of
changes at the end.

### Run It

Predicted with full confidence, not executed standalone: both
`GetFileNameWithoutExtension` and `Split` are extremely basic, stable,
thoroughly documented .NET string operations — this project's real, full
build, and this lesson's own throwaway console proof (next Concept Unit),
both exercise this exact code for real.

### Connecting Back

`TryParseDate` can now break a filename into its three named pieces. The
next Concept Unit decides what to do when a filename doesn't actually
split into exactly three.

---

## Concept Unit: Rejecting the Wrong Shape Early

### The Problem

Not every file `DirectoryScanner` finds will follow this application's
own naming convention — a stray `notes.txt` would already be filtered out
by an earlier lesson's `"*.xml"` pattern, but nothing stops a real,
genuine `.xml` file from having some other name entirely, or from
following a *different* convention this project doesn't recognize.
`parts`, from this lesson's previous Concept Unit, might not actually
have three elements at all in that case — and reading `parts[1]` or
`parts[2]` on an array that doesn't have them would be a real, undefined
failure this project has no way to recover from gracefully.

> If `nameWithoutExtension.Split('_')` is called on a filename with no
> underscores at all, how many elements would the resulting array have?
> What about a filename with five underscores in it? Given `TryParseDate`
> is supposed to report failure honestly rather than crash, at what exact
> point should it decide "this filename doesn't match, stop here" rather
> than continuing to assume it does?

### Introduce the Concept in Isolation

No new isolated example — checking a collection's length before trusting
its contents isn't a new mechanism; it's the same kind of precondition
check an earlier lesson's `if (folder != null)` already established for a
different kind of "is this safe to use yet" question, applied here to an
array's length instead of a reference's nullness.

### Discard the Throwaway Example

Not applicable — no throwaway example was written for this unit.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — modified: `FileDateParser.cs`.
- **Change type** — add (the length check and its early return).
- **Location** — inside `TryParseDate`, immediately after the `Split`
  call from this lesson's previous Concept Unit.
- **Dependencies** — this lesson's previous Concept Unit's `parts` array.

### The New Code

```csharp
if (parts.Length != 3)
{
    return null;
}
```

### The Updated Project

The full `FileDateParser.cs`, with the new lines marked:

```csharp
1  using System.IO;
2  
3  namespace MastercamGenerator;
4  
5  public class FileDateParser
6  {
7      public DateTime? TryParseDate(string fileName)
8      {
9          string nameWithoutExtension = Path.GetFileNameWithoutExtension(fileName);
10         string[] parts = nameWithoutExtension.Split('_');
11 
12         if (parts.Length != 3)               // ← new
13         {                                    // ← new
14             return null;                     // ← new
15         }                                    // ← new
16     }
17 }
```

This still doesn't fully compile — the method still has no `return` for
the case where `parts.Length` really is `3` — but it's now safe to read
`parts[1]` and `parts[2]` on whatever path reaches that point, because
this check has already ruled out any array too short to contain them.

### Mechanical Walkthrough

1. `if (parts.Length != 3)` — the **`if` statement**, with the
   **inequality operator** `!=` (both already fully explained), checking
   `parts.Length` — an array's own length, read the same mechanical way
   any other property is — against the literal `3`, the exact number of
   pieces this lesson's naming convention requires.
2. `return null;` — a **`return` statement** (already fully explained),
   ending the method immediately and honestly reporting "not a match,"
   rather than letting execution continue toward code that assumes
   exactly three parts exist.

### CS Lens

This is a **guard clause** — a real, named pattern: checking a
precondition immediately, at the very top of a method, and exiting right
away if it isn't met, so that everything written *after* the guard clause
can safely assume the condition holds, with no repeated re-checking
scattered through the rest of the method. Also recognized in: airport
security checking identification before a passenger ever reaches the
gate, not partway through boarding; a recipe confirming every ingredient
is actually in the kitchen before the first step of cooking begins; a
factory inspecting raw material before it enters the production line, not
after a defective part has already been built into something larger; a
web form validating that a required field isn't blank before attempting
to save anything to a database.

### SE Lens

The alternative — reading `parts[1]` and `parts[2]` unconditionally, and
letting whatever happens on a too-short array happen — was available, and
would work identically for every filename that actually follows this
project's convention. It fails exactly on the case this lesson exists to
handle: a real `.xml` file with some other name would cause a real crash,
not a graceful, reported failure — turning "a file that isn't a Mastercam
setup sheet" into a program-ending error, rather than the ordinary,
anticipated, non-newest candidate it actually should be treated as.

### Commands Needed

None beyond this lesson's shared, end-of-lesson `dotnet build`.

### Run It

Real, verified proof that this exact check correctly rejects a
wrong-shaped filename, rather than a prediction, comes from this lesson's
own throwaway console check, shown in full in this lesson's next Concept
Unit alongside the parsing logic it protects.

### Connecting Back

`TryParseDate` can now safely assume any code reaching past this guard
clause has exactly three real pieces to work with. The next Concept Unit
is what actually turns two of those three pieces into a real date.

---

## Concept Unit: The Try-Pattern and `DateTime.TryParseExact`

### The Problem

`parts[1]` and `parts[2]` — proven safe to read by this lesson's previous
Concept Unit — hold `"2026-08-26"` and `"0512"` as plain strings.
Nothing yet turns those two strings into a real `DateTime` this project
can actually compare and sort by, the way `FileInfo.LastWriteTime`
already does.

> This application's date-and-time text, once its two pieces are joined
> back together, always looks exactly like `"2026-08-26_0512"` — a fixed,
> known shape. If code needed to turn text in one *specific*, known shape
> into a real `DateTime`, while cleanly reporting failure for text that
> looks nothing like it (rather than crashing), what would the ideal tool
> for that job need to report back — just the parsed value, or something
> else too?

### Introduce the Concept in Isolation

A real, throwaway console project, scaffolded and run for real — because
exactly which malformed filenames this parsing logic correctly rejects,
and what a genuinely valid one actually parses to, are real behavioral
claims the Verification Rule requires proof for, not confident
description:

```csharp
DateTime? TryParseDate(string fileName)
{
    string nameWithoutExtension = Path.GetFileNameWithoutExtension(fileName);
    string[] parts = nameWithoutExtension.Split('_');

    if (parts.Length != 3)
    {
        return null;
    }

    string combined = parts[1] + "_" + parts[2];

    bool parsed = DateTime.TryParseExact(
        combined,
        "yyyy-MM-dd_HHmm",
        CultureInfo.InvariantCulture,
        DateTimeStyles.None,
        out DateTime result);

    if (parsed)
    {
        return result;
    }

    return null;
}
```

Run against five real, escalating inputs — two genuinely valid, three
each wrong in a different way — real, captured output (.NET SDK
10.0.301):

```
SetupSheet_2026-08-26_0512.xml -> 8/26/2026 5:12:00 AM
SetupSheet_2026-08-20_0900.xml -> 8/20/2026 9:00:00 AM
notes.txt -> null
SetupSheet_notadate_0512.xml -> null
Program_1001_2026-08-26_0512.xml -> null
```

This proves, for real: two well-formed names parse to the exact real
dates and times they encode; `notes.txt` (wrong shape entirely, one
piece after splitting) is rejected by this lesson's previous Concept
Unit's guard clause before parsing is even attempted; `SetupSheet_
notadate_0512.xml` (the right *shape* — three pieces — but nonsense where
a date belongs) reaches `TryParseExact` and is correctly rejected there
instead; and `Program_1001_2026-08-26_0512.xml` (four pieces, a
plausible-looking but different real naming scheme) is rejected by the
same guard clause as `notes.txt`, for the same reason.

### Discard the Throwaway Example

The version above, and the console project it ran inside, were both
deleted immediately after this real output was captured — the real
project's own version (below) is functionally identical, just permanently
part of `FileDateParser.cs` rather than a standalone local function.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — modified: `FileDateParser.cs`.
- **Change type** — add (joining the two remaining parts and parsing
  them).
- **Location** — inside `TryParseDate`, after this lesson's previous
  Concept Unit's guard clause.
- **Dependencies** — this lesson's previous Concept Unit's `parts` array,
  already proven to have exactly three elements past this point.

### The New Code

```csharp
string combined = parts[1] + "_" + parts[2];

bool parsed = DateTime.TryParseExact(
    combined,
    "yyyy-MM-dd_HHmm",
    CultureInfo.InvariantCulture,
    DateTimeStyles.None,
    out DateTime result);

if (parsed)
{
    return result;
}

return null;
```

### The Updated Project

The full `FileDateParser.cs`, with the new lines marked:

```csharp
1  using System.Globalization;
2  using System.IO;
3  
4  namespace MastercamGenerator;
5  
6  public class FileDateParser
7  {
8      public DateTime? TryParseDate(string fileName)
9      {
10         string nameWithoutExtension = Path.GetFileNameWithoutExtension(fileName);
11         string[] parts = nameWithoutExtension.Split('_');
12 
13         if (parts.Length != 3)
14         {
15             return null;
16         }
17 
18         string combined = parts[1] + "_" + parts[2];                    // ← new
19 
20         bool parsed = DateTime.TryParseExact(                           // ← new
21             combined,                                                    // ← new
22             "yyyy-MM-dd_HHmm",                                           // ← new
23             CultureInfo.InvariantCulture,                                // ← new
24             DateTimeStyles.None,                                         // ← new
25             out DateTime result);                                        // ← new
26 
27         if (parsed)                                                     // ← new
28         {                                                                // ← new
29             return result;                                               // ← new
30         }                                                                // ← new
31 
32         return null;                                                    // ← new
33     }
34 }
```

`TryParseDate` now compiles and does everything this lesson set out to
build: given a filename following this project's own convention, it
returns the real date and time encoded in it; given anything else, it
returns `null`, honestly, at whichever point the mismatch was actually
detected. `using System.Globalization;` is also added, for `CultureInfo`
and `DateTimeStyles`, both below.

### Mechanical Walkthrough

1. `string combined = parts[1] + "_" + parts[2];` — reads `parts[1]`
   (`"2026-08-26"`) and `parts[2]` (`"0512"`) by direct array index — safe
   here specifically because this lesson's previous Concept Unit's guard
   clause already ruled out any array too short to contain them — and
   joins them back together with a literal underscore in between, using
   the `+` string concatenation operator, producing `"2026-08-26_0512"`.
2. `bool parsed = DateTime.TryParseExact(combined, "yyyy-MM-dd_HHmm",
   CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime
   result);` — calls **`DateTime.TryParseExact`** (Header above), the
   literal **Try-pattern** (Header above) in action: `combined` is the
   text to parse; `"yyyy-MM-dd_HHmm"` is the exact format it must match
   (four-digit year, two-digit month, two-digit day, an underscore, then
   two-digit hour and two-digit minute in 24-hour time); **`CultureInfo.
   InvariantCulture`** (Header above) and **`DateTimeStyles.None`**
   (Header above) are passed as required arguments; `out DateTime result`
   declares a brand-new local variable, `result`, right at the call site,
   as an **`out` parameter** (Header above) — `TryParseExact` itself is
   responsible for assigning it before this line finishes. The method's
   own `bool` return value — `true` if parsing succeeded — is stored in
   `parsed`.
3. `if (parsed)` — the **`if` statement**, its condition simply the `bool`
   `parsed` read directly (no comparison operator needed, since `parsed`
   is already exactly the `true`/`false` value the condition needs).
4. `return result;` — inside the `if`: a **`return` statement**, handing
   back the real, successfully parsed `DateTime` that `TryParseExact`
   wrote into `result`.
5. `return null;` — reached only if `parsed` was `false`: the same honest
   failure report this lesson's earlier guard clause already used, for a
   different reason (a filename that split into three pieces, but whose
   middle two pieces still didn't form a real, valid date and time).

### CS Lens

`TryParseExact`'s shape — a `bool` success flag plus an `out` result — is
the **Try-pattern** (Header above), one of the most common idioms in all
of .NET for exactly this situation: an operation that fails constantly,
routinely, and expectedly, for reasons that are entirely normal (a user
typed something wrong, a file doesn't follow a convention) rather than
exceptional. Also recognized, throughout .NET itself, in: `int.TryParse`,
turning text into a number or reporting failure without throwing;
`Guid.TryParse`, doing the same for unique identifiers;
`Dictionary<TKey,TValue>.TryGetValue`, looking up a key and reporting
whether it was actually found, rather than throwing when it wasn't.

### SE Lens

The alternative — `DateTime.ParseExact` (without "Try"), which throws a
`FormatException` for anything that doesn't match — was available, and is
the *right* choice in situations where a mismatch genuinely means
something has gone wrong and the program shouldn't continue past it. It's
wrong here specifically because a filename not matching this convention
is an ordinary, fully expected outcome this project needs to keep running
past, not a bug to crash on — using an exception-throwing method here
would mean wrapping every single call in a `try`/`catch` (already fully
explained in an earlier lesson) just to convert an entirely routine
"didn't match" outcome back into the same kind of honest, non-crashing
answer `TryParseExact` already provides directly.

### Commands Needed

- `dotnet new console -n ScratchDateParseCheck` — scaffolds this unit's
  own throwaway proof project.
- `dotnet run` — runs it, producing the real, escalating-input output
  quoted above.

### Run It

Shown above, in full, as real captured output across five real,
escalating inputs — not predicted, since exactly which malformed inputs
get rejected, and at which specific step, is exactly the kind of claim
this curriculum's own schema requires proof for.

### Connecting Back

`FileDateParser` is now complete and safe to call on any filename at all,
valid or not. The final Concept Unit puts it to work inside
`NewestFileResolver`, changing what "newest" actually means.

---

## Concept Unit: Filtering to Valid Candidates and Resolving Among Them

### The Problem

`NewestFileResolver.FindNewest`, as an earlier lesson left it, picks the
file with the latest `FileInfo.LastWriteTime` — a purely filesystem fact.
This lesson's own opening paragraph already named the problem with that:
a file's last-write time and its filename's own encoded date are two
different facts that happen to usually agree, but don't have to (a file
copied from elsewhere keeps its original name but gets a brand-new
last-write time the instant it's copied, for instance). This project's
own outline calls for a *deliberate* decision here, not an assumption.

> Given `FileDateParser.TryParseDate` can now say, for any file, either
> "here's its real encoded date" or "this file doesn't follow the
> convention at all," what should `FindNewest` do differently with a file
> in that second category — one that's a real, genuine `.xml` file, just
> not one whose name this project's convention can make sense of? Should
> it still be eligible to be reported as "newest"?

### Introduce the Concept in Isolation

No new isolated example — this unit combines two constructs already
fully proven on their own: `Where` (this lesson's own new Objects/methods
entry, mechanically identical to the already fully explained
`OrderByDescending`/`MaxBy` as an extension method taking a lambda) and
`MaxBy` itself, already fully proven correct, on this project's own real
`InputFile` data, in an earlier lesson. Combining two already-proven LINQ
methods into one short pipeline needs no separate throwaway version
first.

### Discard the Throwaway Example

Not applicable — no new throwaway example was written for this unit.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — modified: `NewestFileResolver.cs`.
- **Change type** — replace (the `MaxBy(file => file.LastModified)`
  implementation from an earlier lesson) and add (a new field).
- **Location** — the class body (new field) and inside `FindNewest`
  (replaced body).
- **Dependencies** — this lesson's completed `FileDateParser`.

### The New Code

```csharp
private readonly FileDateParser _fileDateParser = new FileDateParser();

public InputFile? FindNewest(IEnumerable<InputFile> files)
{
    IEnumerable<InputFile> candidates = files.Where(file => _fileDateParser.TryParseDate(file.FileName) != null);

    return candidates.MaxBy(file => _fileDateParser.TryParseDate(file.FileName));
}
```

### The Updated Project

The full `NewestFileResolver.cs`, with the changed lines marked:

```csharp
1  namespace MastercamGenerator;
2  
3  public class NewestFileResolver
4  {
5      private readonly FileDateParser _fileDateParser = new FileDateParser();   // ← new
6  
7      public InputFile? FindNewest(IEnumerable<InputFile> files)
8      {
9          IEnumerable<InputFile> candidates = files.Where(file => _fileDateParser.TryParseDate(file.FileName) != null);  // ← new
10 
11         return candidates.MaxBy(file => _fileDateParser.TryParseDate(file.FileName));  // ← changed (was file => file.LastModified)
12     }
13 }
```

`FindNewest`'s public signature — `public InputFile? FindNewest
(IEnumerable<InputFile> files)` — hasn't changed at all from an earlier
lesson. Nothing in `MainWindow.xaml.cs`, which already calls exactly this
method, needs to change either: it keeps calling the same method, on the
same field, and keeps receiving the same kind of answer — an `InputFile?`
— even though what that answer actually *means* has changed completely
underneath it.

### Mechanical Walkthrough

1. `private readonly FileDateParser _fileDateParser = new
   FileDateParser();` — the identical field pattern already established,
   in earlier lessons, for `_fileSource` and `_directoryScanner` on
   `MainWindow` — this time on `NewestFileResolver` itself, holding this
   lesson's own new class.
2. `IEnumerable<InputFile> candidates = files.Where(file =>
   _fileDateParser.TryParseDate(file.FileName) != null);` — calls
   **`Enumerable.Where`** (Header above) on `files`, with a lambda
   expression (already fully explained) checking, for each file, whether
   `_fileDateParser.TryParseDate(file.FileName)` — this lesson's own
   method — returns something other than `null`. The result,
   `candidates`, is a real, working answer to the curriculum's own
   "valid?" decision point: every file whose name this project's
   convention can actually parse, and none that it can't.
3. `return candidates.MaxBy(file => _fileDateParser.TryParseDate
   (file.FileName));` — calls `MaxBy` (an earlier lesson's own subject,
   its mechanics unchanged) on `candidates` instead of the original
   `files`, with a lambda calling `TryParseDate` again — the key this
   comparison now sorts by is each candidate's parsed filename date, not
   its filesystem `LastModified` — this is the entire, complete change
   this lesson makes to what "newest" means.

### CS Lens

The fact that `MainWindow` needed zero changes for this lesson's entire
new capability to take effect is **encapsulation** paying off, concretely
— not just as an abstract claim, but as something this lesson can point
to directly: `NewestFileResolver`'s public contract (Header above)
completely fixes what callers can rely on — a method taking files, and
returning the newest one — while leaving *how* "newest" gets decided
entirely private, free to change without rippling outward. Also
recognized in: a car's accelerator pedal working identically whether the
engine underneath is a four-cylinder or a V8; a restaurant's menu staying
the same even if the kitchen switches suppliers for an ingredient; a
power outlet delivering the same interface to any appliance, regardless of
which power plant is actually generating the electricity behind it.

### SE Lens

A real, honest cost this lesson's own change introduces: `TryParseDate` is
now called twice per candidate file — once inside `Where`, once again
inside `MaxBy` — recomputing the identical parse each time, rather than
computing it once and reusing the result. For a folder with a handful of
files, this is genuinely negligible; for a folder with many thousands, it
would mean real, avoidable, repeated work. This lesson accepts that cost
deliberately, in favor of two short, separately readable LINQ calls
instead of a more efficient but more complex version computing each file's
parsed date once and carrying it alongside the file itself — a real
tradeoff between simplicity and efficiency, worth revisiting explicitly if
this project's real folders ever grow large enough for the repeated work
to actually matter, rather than optimized preemptively before there's any
real evidence it needs to be.

### Commands Needed

None beyond this lesson's one shared `dotnet build`, run once, covering
every Concept Unit's changes together — shown next.

### Run It

Real, captured output from running `dotnet build` against this lesson's
complete, final `FileDateParser.cs` and `NewestFileResolver.cs` (.NET SDK
10.0.301), unedited:

```
Determining projects to restore...
All projects are up-to-date for restore.
MastercamGenerator -> <project>\bin\Debug\net10.0-windows\MastercamGenerator.dll

Build succeeded.
    0 Warning(s)
    0 Error(s)

Time Elapsed 00:00:01.67
```

This one real build covers every Concept Unit in this lesson at once —
`FileDateParser`'s filename splitting, its guard clause, its
`TryParseExact`-based parsing, and this unit's own rewritten
`NewestFileResolver` all compiled together, in a single pass, per this
curriculum's own batching practice. No changes to `MainWindow.xaml` or
`MainWindow.xaml.cs` were needed for this lesson at all.

### Connecting Back

Every earlier Concept Unit in this lesson built one piece of a chain this
unit finally puts to use: splitting a filename (first unit) and rejecting
the wrong shape (second unit) made a filename safe to read from; real,
verified parsing (third unit) turned it into a trustworthy date. This unit
is what actually changes this project's behavior — not by touching the
UI at all, but by changing, underneath an unchanged public contract, what
"newest" has meant all along.

---

## Connect the Pieces

Trace one real folder scan — containing one file whose last-write time is
misleading (copied recently, but named with an older date) and one file
genuinely named with the latest date — through every piece this lesson
built:

1. `DirectoryScanner` (an earlier lesson) finds both files and produces
   `InputFile`s for each, exactly as before — this lesson changes nothing
   about discovery itself.
2. `NewestFileResolver.FindNewest` (this lesson's fourth Concept Unit) is
   called, exactly as an earlier lesson already wired it — `MainWindow`
   itself does nothing differently.
3. `files.Where(...)` (fourth Concept Unit) calls `_fileDateParser.
   TryParseDate(file.FileName)` (this lesson's first three Concept Units)
   on each file. For a file that genuinely follows this project's naming
   convention, `Path.GetFileNameWithoutExtension` and `Split` (first
   unit) produce three real pieces; the guard clause (second unit) lets
   them through; `TryParseExact` (third unit) successfully parses a real
   `DateTime` from the filename's own text — none of this reads
   `FileInfo.LastWriteTime` at all.
4. `candidates` now holds every file whose name actually parsed —
   `Where`'s own real, working answer to "valid?"
5. `candidates.MaxBy(file => _fileDateParser.TryParseDate
   (file.FileName))` (fourth Concept Unit) compares every candidate by
   its *filename's own* date, not its filesystem timestamp — the
   recently-copied-but-older-named file loses this comparison to the
   genuinely newer-named one, even if its filesystem timestamp might have
   said otherwise.
6. `FindNewest` returns that real `InputFile`. `BrowseButton_Click` (an
   earlier lesson's own, entirely unmodified code) receives it exactly as
   before and displays it — the whole decision underneath it changed
   completely; nothing about how it's called, or how the answer reaches
   the screen, needed to.

This lesson never touched a single line of `MainWindow`, and yet
completely changed what this project means by "newest" — the concrete
payoff of every earlier lesson's insistence on keeping application logic
in its own classes, behind its own narrow, stable contracts, reachable
from the UI through exactly one method call.
