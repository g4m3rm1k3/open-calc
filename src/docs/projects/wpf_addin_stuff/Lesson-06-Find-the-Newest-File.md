# Lesson 6: Asking a Question of a Whole Collection — Finding the Newest File

**What you will build.** A `NewestFileResolver` class that, given any
sequence of `InputFile`s, picks out the single newest one by its
`LastModified` timestamp — or honestly reports that there isn't one, if
the sequence is empty. Wiring it into `MainWindow` means picking a folder
now also shows which discovered file is the newest, updating every time a
new folder is scanned. What this lesson is actually about goes past this
one class: every collection operation this project has done so far
(filtering to just XML files, converting each `FileInfo` into an
`InputFile`) preserved every surviving element — the collection went in
with some number of items and came out with the same number, just
filtered or transformed. This is the first place this project narrows a
whole collection down to a single answer, and the first time it reaches
for LINQ, .NET's own built-in vocabulary for exactly this kind of
question.

**What you need to know first.** Lesson 3 — the `FileSource`/plain-class
pattern this lesson's own `NewestFileResolver` follows again. Lesson 5 —
`DirectoryScanner.ScanDirectory`'s `List<InputFile>` return value, which
this lesson's resolver consumes, and the `foreach`/collection habits that
lesson established, which this lesson's LINQ methods replace with a more
direct alternative for this specific kind of question.

**Terms used in this lesson.**

- **LINQ (Language Integrated Query)** — a set of methods, built into
  .NET's `System.Linq` namespace, for querying any sequence of data —
  filtering it, transforming it, sorting it, or reducing it to a single
  answer — using a small, consistent vocabulary shared across every
  collection type that supports it. It exists because "find the largest,"
  "sort by this," and "keep only the ones matching this condition" are
  questions asked of collections constantly, in almost every program ever
  written, and before LINQ existed, each one had to be hand-written as its
  own loop, every time, in every codebase, with its own chance to get some
  small detail wrong.
- **lambda expression** — a way of writing a small, unnamed function
  directly inline, wherever a function is needed as a value, instead of
  declaring it separately with its own name beforehand. Written as a
  parameter list, an arrow (`=>`), and an expression — `file =>
  file.LastModified` reads as "given some `file`, produce
  `file.LastModified`." It exists because LINQ methods like this lesson's
  `OrderByDescending` and `MaxBy` need to be told, in one specific spot,
  exactly what to do with each element — and writing a fully separate,
  named method just to state one short computation, used in exactly one
  place, would be far more ceremony than the actual idea deserves.
- **`else` clause** — an optional second branch on an `if` statement,
  running exactly when the `if`'s own condition evaluated to `false`,
  rather than being skipped entirely the way a bare `if` with no `else`
  would be. It exists so "do one thing or another, but always exactly
  one" can be stated as a single unit, rather than as two separate,
  unconnected `if` statements that each have to independently reason
  about the same condition (one checking it, the other checking its
  opposite).

**Objects and methods used.**

- **`NewestFileResolver`**
  - *What it is:* this project's new class representing "something that
    can look at a whole collection of files and say which one is newest."
  - *Implementation:* `public class NewestFileResolver` in the
    `MastercamGenerator` namespace — no base class, the same plain-class
    shape `FileSource` and `DirectoryScanner` already established.
  - *Its use:* the new home for this project's "which file matters most
    right now" logic, kept separate from the logic that finds files at
    all (`DirectoryScanner`) and separate from the UI that displays the
    answer (`MainWindow`).
  - *Type:* a public class, instantiated once, with `new`.
  - *Responsibility:* answering exactly one question — given some files,
    which one is newest — and nothing about how those files were found or
    how the answer gets shown.
  - *Depends on:* nothing beyond being constructed.
  - *Connects to:* constructed once by `MainWindow`, stored in a
    `readonly` field, the same pattern already established for
    `FileSource` and `DirectoryScanner`; called from `BrowseButton_Click`,
    after `DirectoryScanner.ScanDirectory` returns.
  - *Shape:* a third real dependency boundary in this project — deciding
    *which* file matters, kept deliberately separate from *finding* files
    at all.
- **`NewestFileResolver.FindNewest(IEnumerable<InputFile>)`**
  - *What it is:* the one method `NewestFileResolver` exposes.
  - *Implementation:* `public InputFile? FindNewest(IEnumerable<InputFile>
    files)` — a **nullable reference type** return (already fully
    explained in an earlier lesson), because there may genuinely be no
    newest file if `files` turns out to be empty.
  - *Its use:* the single call `BrowseButton_Click` makes once
    `DirectoryScanner` has produced a real list of discovered files.
  - *Type:* a public instance method.
  - *Responsibility:* comparing every file's `LastModified` value and
    reporting back the one with the latest timestamp — or `null`, if there
    was nothing to compare.
  - *Depends on:* a real (possibly empty) sequence of `InputFile`s.
  - *Connects to:* called from `BrowseButton_Click`; internally calls
    `MaxBy` (below) on whatever it's given.
  - *Shape:* the one public entry point into this lesson's new class.
- **`IEnumerable<InputFile>`**
  - *What it is:* a generic interface representing "some sequence of
    `InputFile`s that can be walked, one at a time, from start to finish"
    — nothing more specific than that.
  - *Implementation:* `IEnumerable<T>`, in `System.Collections.Generic`,
    declares one real member that matters here: a way to get an
    enumerator that yields each element in turn (the exact mechanism a
    **`foreach` loop**, already fully explained in an earlier lesson, uses
    internally). `List<T>` — already this project's own, concrete
    collection type — implements this interface, among others, which is
    why a `List<InputFile>` can be passed anywhere an `IEnumerable
    <InputFile>` is expected with no conversion needed at all.
  - *Its use:* the declared parameter type of `FindNewest`, chosen instead
    of requiring specifically a `List<InputFile>`.
  - *Type:* a generic interface — not a class, never instantiated with
    `new` directly; something either already implements it, or doesn't.
  - *Responsibility:* stating the one, minimal capability `FindNewest`
    actually needs from whatever it's handed — "let me walk your
    elements" — and nothing more specific than that.
  - *Depends on:* whatever real, concrete type is actually implementing
    it — here, `List<InputFile>`, though `FindNewest` itself never has to
    know or care that it's specifically a `List`.
  - *Connects to:* `DirectoryScanner.ScanDirectory`'s `List<InputFile>`
    result flows straight into `FindNewest` without any conversion,
    because `List<InputFile>` already satisfies this interface.
  - *Shape:* the narrowest possible contract for "a sequence of things" —
    narrower than `List<T>`, which promises indexing, a `Count`, and
    growth on top of what `IEnumerable<T>` alone requires.
- **`Enumerable.OrderByDescending<TSource,TKey>(IEnumerable<TSource>, Func<TSource,TKey>)`**
  - *What it is:* the LINQ method that sorts a sequence from largest key to
    smallest.
  - *Implementation:* `public static IOrderedEnumerable<TSource>
    OrderByDescending<TSource,TKey>(this IEnumerable<TSource> source,
    Func<TSource,TKey> keySelector)` — an **extension method** (a `static`
    method that can be called with instance-method syntax on any
    `IEnumerable<TSource>`, via the leading `this` on its first parameter)
    — confirmed against the method's own published definition, not
    assumed. It does not sort `source` in place; it returns a new,
    ordered sequence, computed lazily (not actually sorted until
    something, such as `FirstOrDefault`, actually asks for an element).
  - *Its use:* this lesson's first attempt at finding the newest file —
    sort every file newest-first, then take the first one.
  - *Type:* a `static` extension method.
  - *Responsibility:* producing a fully-ordered version of whatever
    sequence it's given, according to whatever key the caller's lambda
    expression extracts from each element.
  - *Depends on:* a non-null `source` and a non-null `keySelector`.
  - *Connects to:* called on the `IEnumerable<InputFile>` passed into
    `FindNewest`; its result is immediately handed to `FirstOrDefault`
    (below).
  - *Shape:* this lesson's first, more general tool — sorting everything,
    even though only the very first result actually gets used.
- **`Enumerable.FirstOrDefault<TSource>(IEnumerable<TSource>)`**
  - *What it is:* the LINQ method that returns a sequence's first element,
    or a safe default if the sequence is empty.
  - *Implementation:* `public static TSource? FirstOrDefault<TSource>
    (this IEnumerable<TSource> source)` — confirmed against the method's
    own published definition: for a reference type like `InputFile`, the
    "safe default" it returns for an empty sequence is `null`, never an
    exception.
  - *Its use:* paired with `OrderByDescending`, above, to pull just the
    single newest element out of the freshly-sorted sequence.
  - *Type:* a `static` extension method.
  - *Responsibility:* handing back exactly one element — the first — or
    `null`, without the caller needing to check the sequence's length
    first.
  - *Depends on:* a non-null `source`.
  - *Connects to:* called on the result of `OrderByDescending`, above.
  - *Shape:* the "take just one" half of this lesson's first, two-step
    approach.
- **`Enumerable.MaxBy<TSource,TKey>(IEnumerable<TSource>, Func<TSource,TKey>)`**
  - *What it is:* the LINQ method that returns whichever element has the
    largest key, without sorting anything else.
  - *Implementation:* `public static TSource? MaxBy<TSource,TKey>(this
    IEnumerable<TSource> source, Func<TSource,TKey> keySelector)` —
    confirmed against the method's own published definition: for a
    reference type like `InputFile`, an empty sequence produces `null`,
    not an exception, exactly like `FirstOrDefault` — real, verified
    proof of this, for this project's own actual data shape, comes from
    this lesson's own throwaway console check, below.
  - *Its use:* this lesson's actual, final implementation of
    `FindNewest` — a single call replacing `OrderByDescending`
    `.FirstOrDefault()`'s two.
  - *Type:* a `static` extension method.
  - *Responsibility:* finding the single element with the greatest key,
    in one pass over the sequence, without ever needing to know the
    relative order of anything except the current best candidate.
  - *Depends on:* a non-null `source` and `keySelector`.
  - *Connects to:* called directly on the `IEnumerable<InputFile>` passed
    into `FindNewest`; its result is `FindNewest`'s own return value.
  - *Shape:* the more direct tool this lesson lands on, replacing the
    two-method chain above with one call that does the same job.

---

## Concept Unit: `IEnumerable<T>` — Accepting Any Sequence, Not Just a List

### The Problem

`DirectoryScanner.ScanDirectory` returns a `List<InputFile>`. If
`NewestFileResolver.FindNewest` is declared to accept specifically a
`List<InputFile>` as its parameter, it would work today — but it would
also mean `FindNewest` can never be called on any other kind of
collection (an array of `InputFile`, for instance, or some future
collection type this curriculum hasn't introduced yet) without first
converting it into a `List`, even though `FindNewest`'s own logic doesn't
actually need anything a `List` can do that a plainer kind of sequence
can't.

> `FindNewest` needs to look at every file, one at a time, to find the
> newest — nothing about that requires indexing into the collection by
> number, checking its `Count` ahead of time, or adding anything to it.
> Given that, does the parameter really need to be exactly a
> `List<InputFile>` — or could it ask for something narrower, that a
> `List<InputFile>` (and other kinds of collections too) would already
> satisfy?

### Introduce the Concept in Isolation

No new isolated example — `IEnumerable<T>` isn't a new mechanism to
demonstrate running code for; it's a narrower way of describing something
this project's own `foreach` loops have already used correctly, several
times, without ever needing the word "list" to make that work. A
`foreach` loop over a `List<InputFile>`, already proven real in an earlier
lesson, works through exactly the enumeration contract `IEnumerable<T>`
declares — nothing about that proof changes by naming the contract itself
now, rather than the concrete type that happens to satisfy it.

### Discard the Throwaway Example

Not applicable — no throwaway example was written for this unit.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — created: `NewestFileResolver.cs`, in the
  `MastercamGenerator/` project folder.
- **Change type** — add (a brand-new file).
- **Location** — n/a; the start of a new file.
- **Dependencies** — `InputFile` (an earlier lesson's own record).

### The New Code

```csharp
namespace MastercamGenerator;

public class NewestFileResolver
{
    public InputFile? FindNewest(IEnumerable<InputFile> files)
    {
    }
}
```

### The Updated Project

This *is* the whole new structure — a brand-new file with nothing
surrounding it yet — so there is nothing further to return to.

### Mechanical Walkthrough

1. `namespace MastercamGenerator;` and `public class NewestFileResolver` —
   the same **namespace** and plain **`class`** declaration pattern
   (already fully explained in an earlier lesson) as `FileSource` and
   `DirectoryScanner`.
2. `public InputFile? FindNewest(IEnumerable<InputFile> files)` — a
   method declaration returning `InputFile?` (a **nullable reference
   type**, already fully explained), named `FindNewest`, taking one
   parameter, `files`, of type **`IEnumerable<InputFile>`** (Header
   above) — `InputFile` filling in `IEnumerable<T>`'s own type parameter,
   the identical mechanism an earlier lesson's `List<InputFile>` already
   demonstrated for a different generic type.

### CS Lens

This is **programming to an interface, not an implementation** — a real,
named software design principle: code that only actually needs a
narrower capability should declare a dependency on that narrower
capability, not on whichever specific concrete type happens to provide it
today. `FindNewest` needs "something I can walk through, once, in order"
— exactly what `IEnumerable<T>` promises — not "specifically a `List`."
Also recognized in: a lamp socket accepting any bulb built to a standard
fitting, not one specific manufacturer's exact bulb; a car's fuel tank
accepting gasoline from any compliant pump, not one specific gas station's
own equipment; a universal remote's IR signal working on any TV that
understands the same protocol, regardless of brand.

### SE Lens

The alternative — declaring `FindNewest(List<InputFile> files)` — was
available, and would work identically for every call this project
actually makes today, since `DirectoryScanner.ScanDirectory` already
returns exactly a `List<InputFile>`. The real cost of that choice would
only show up later: if a future lesson in this curriculum ever produces
discovered files some other way (directly from an array, or from a
different collection type entirely), a `List`-only `FindNewest` would
force a conversion at every call site, for no reason connected to what
`FindNewest` itself actually does with its input. Declaring the narrower
`IEnumerable<InputFile>` now costs nothing today and removes that future
friction entirely.

### Commands Needed

None yet beyond `dotnet build`, run once for this lesson's whole batch of
changes at the end.

### Run It

Not applicable — this unit's code is an incomplete method signature; it
doesn't run yet, and isn't claimed to.

### Connecting Back

`NewestFileResolver` now has the right shape to accept whatever
`DirectoryScanner` (an earlier lesson's own class) hands it, without
needing to know that class exists at all. The method's body — the actual
question-answering logic — is this lesson's remaining Concept Units.

---

## Concept Unit: Lambda Expressions and Sorting With `OrderByDescending`

### The Problem

`FindNewest` needs to compare files by their `LastModified` value and
figure out which one comes first once sorted newest-to-oldest. LINQ's
sorting methods don't know, in advance, which property of an `InputFile`
matters for this comparison — `LastModified` is this lesson's own choice,
not something `OrderByDescending` could guess on its own. Something has
to tell it, for any given file, exactly which value to compare by.

> If a method needed you to hand it a small piece of logic — "given one of
> these, tell me what value to compare it by" — rather than a value
> itself, would writing and naming an entire separate method, just for
> that one line of logic, feel proportionate? What's the smallest possible
> way to write "take a file, give back its `LastModified`" without
> declaring it as its own standalone method first?

### Introduce the Concept in Isolation

A tiny, uninvolved lambda expression, its behavior predictable with real
confidence — this exact syntax has been stable, standard C# since long
before this project began, not a compiler quirk needing fresh proof:

```csharp
Func<int, int> square = x => x * x;
int result = square(5);
```

`x => x * x` is a **lambda expression**: an unnamed function taking one
parameter, `x`, and producing `x * x`. `result` ends up holding `25` —
calling `square(5)` runs the lambda's body with `x` standing in for `5`,
the same way calling any named method substitutes its arguments for its
parameters.

### Discard the Throwaway Example

`square` doesn't appear in the real project — it exists only to isolate
lambda syntax itself before this lesson's real lambda (below) does the
same thing for `InputFile.LastModified` instead of simple arithmetic.
Discarded now.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — modified: `NewestFileResolver.cs`.
- **Change type** — add (a first, working implementation of
  `FindNewest`).
- **Location** — inside `FindNewest`'s previously-empty body.
- **Dependencies** — this lesson's previous Concept Unit's method
  signature.

### The New Code

```csharp
return files.OrderByDescending(file => file.LastModified).FirstOrDefault();
```

### The Updated Project

The full `NewestFileResolver.cs`, with the new line marked:

```csharp
1  namespace MastercamGenerator;
2  
3  public class NewestFileResolver
4  {
5      public InputFile? FindNewest(IEnumerable<InputFile> files)
6      {
7          return files.OrderByDescending(file => file.LastModified).FirstOrDefault();  // ← new
8      }
9  }
```

`FindNewest` now compiles and produces a real answer: every file in
`files`, sorted newest-first, with just the first one kept.

### Mechanical Walkthrough

1. `files.OrderByDescending(file => file.LastModified)` — calls
   **`Enumerable.OrderByDescending`** (Header above) on `files`, passing
   a **lambda expression** (Header above), `file => file.LastModified`:
   for each `InputFile` in the sequence (named `file` inside the lambda),
   read its `LastModified` property (an earlier lesson's own `InputFile`
   record already generates this) and use that value as the sort key.
   The result is a new, ordered sequence — every original file still
   present, just reordered, newest first.
2. `.FirstOrDefault()` — calls **`Enumerable.FirstOrDefault`** (Header
   above) on that ordered sequence, taking just its first element — the
   single newest file — or `null`, if `files` was empty to begin with,
   which flows straight through both calls unchanged.
3. `return ...;` — a **`return` statement** (already fully explained in
   an earlier lesson), handing back whatever `FirstOrDefault` produced as
   `FindNewest`'s own result.

### CS Lens

Chaining `OrderByDescending(...)` into `.FirstOrDefault()` is a real
instance of **method chaining** — each method returns something the next
one can immediately be called on, letting a whole pipeline of operations
be written as one expression instead of several separate statements each
assigned to its own intermediate variable. Also recognized in: a factory
assembly line where each station hands its output directly to the next
station, with no intermediate storage bin between them; a recipe's steps
performed in sequence directly on the same bowl, rather than dirtying a
fresh dish at every stage; a Unix shell pipeline (`cmd1 | cmd2 | cmd3`),
where each command's output feeds directly into the next.

### SE Lens

The alternative — writing this same logic as a hand-rolled `foreach` loop,
tracking the "best so far" file in a local variable and comparing each new
one against it — was available, and is exactly what a version of this
method written before LINQ existed would have looked like. `OrderByDescending
().FirstOrDefault()` reads closer to the English question being asked
("what's the newest one?") than a loop with a manually-updated "best so
far" variable would, at a real, deliberate cost this lesson's next Concept
Unit names directly: sorting the *entire* sequence just to look at its
first element does more work than the question actually requires.

### Commands Needed

None beyond this lesson's shared, end-of-lesson `dotnet build`.

### Run It

Predicted with full confidence for the sorting/selection mechanics
themselves (both methods' documented, stable behavior); the specific
result for this project's own real `InputFile` data is shown for real, via
this lesson's own throwaway console check, in the next Concept Unit, where
the same values are compared against `MaxBy`'s answer directly.

### Connecting Back

`FindNewest` now works, correctly, for real — this lesson's next Concept
Unit doesn't fix a bug in it; it replaces a working answer with a more
direct way of reaching the identical one.

---

## Concept Unit: `MaxBy` — The Same Answer, Found More Directly

### The Problem

`OrderByDescending(...).FirstOrDefault()` (previous Concept Unit) sorts
every single file in the sequence, just to throw away every result except
the very first one. For a folder with a handful of files, that waste is
invisible; for a folder with thousands, it's real, needless work — sorting
the whole sequence to answer a question that only ever needed to know
which *one* element was largest, never their full relative order.

> If all you ever need is the single largest value in a collection, do you
> need to know the exact order of every *other* value too — whether the
> second-largest is bigger than the third-largest, and so on — or is that
> extra information this specific question never actually asks for?

### Introduce the Concept in Isolation

A real, throwaway console project, scaffolded and run for real — because
whether `MaxBy` genuinely finds the same answer as the previous unit's
two-method chain, and what it does on an empty sequence specifically, are
exactly the kind of claims the Verification Rule requires proof for:

```csharp
var files = new List<ScratchFile>
{
    new ScratchFile("a.xml", new DateTime(2026, 8, 20, 9, 0, 0)),
    new ScratchFile("b.xml", new DateTime(2026, 8, 26, 5, 12, 0)),
    new ScratchFile("c.xml", new DateTime(2026, 8, 22, 14, 30, 0)),
};

ScratchFile? newestByOrder = files.OrderByDescending(f => f.Modified).FirstOrDefault();
Console.WriteLine($"OrderByDescending+FirstOrDefault: {newestByOrder?.Name} {newestByOrder?.Modified}");

ScratchFile? newestByMaxBy = files.MaxBy(f => f.Modified);
Console.WriteLine($"MaxBy: {newestByMaxBy?.Name} {newestByMaxBy?.Modified}");

var empty = new List<ScratchFile>();
ScratchFile? emptyResult = empty.MaxBy(f => f.Modified);
Console.WriteLine($"MaxBy on empty list: {(emptyResult == null ? "null" : emptyResult.Name)}");

public record ScratchFile(string Name, DateTime Modified);
```

Real, captured output from running this exact code (.NET SDK 10.0.301):

```
OrderByDescending+FirstOrDefault: b.xml 8/26/2026 5:12:00 AM
MaxBy: b.xml 8/26/2026 5:12:00 AM
MaxBy on empty list: null
```

This proves three things at once, for real: both approaches agree on the
same answer (`b.xml`, the one dated `2026-08-26`, genuinely later than
either `2026-08-20` or `2026-08-22`); `MaxBy` reaches that answer with one
method call instead of two; and calling `MaxBy` on a genuinely empty
sequence returns `null` rather than throwing an exception — safe,
verified behavior for `ScratchFile`, a reference type exactly like this
project's own `InputFile`.

### Discard the Throwaway Example

`ScratchFile` and the console project it ran inside were both deleted
immediately after this real output was captured — neither is a persisted
part of this curriculum's project.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — modified: `NewestFileResolver.cs`.
- **Change type** — replace (the previous Concept Unit's `OrderByDescending
  ().FirstOrDefault()` chain).
- **Location** — inside `FindNewest`'s `return` statement.
- **Dependencies** — this lesson's previous Concept Unit's working
  implementation, being replaced, not extended.

### The New Code

```csharp
return files.MaxBy(file => file.LastModified);
```

### The Updated Project

The full `NewestFileResolver.cs`, with the changed line marked:

```csharp
1  namespace MastercamGenerator;
2  
3  public class NewestFileResolver
4  {
5      public InputFile? FindNewest(IEnumerable<InputFile> files)
6      {
7          return files.MaxBy(file => file.LastModified);  // ← changed (was OrderByDescending().FirstOrDefault())
8      }
9  }
```

`FindNewest` now reaches the identical, already-correct answer through
one method call instead of two.

### Mechanical Walkthrough

1. `files.MaxBy(file => file.LastModified)` — calls **`Enumerable.
   MaxBy`** (Header above) on `files`, passing the identical **lambda
   expression** (Header above) from the previous Concept Unit,
   `file => file.LastModified` — the exact same "what to compare by"
   instruction, reused unchanged, because the question itself hasn't
   changed, only the tool answering it.
2. `return ...;` — a **`return` statement** (already fully explained),
   handing back `MaxBy`'s result directly — no second method call needed,
   unlike the previous Concept Unit's chain.

### CS Lens

Choosing the single most direct tool for exactly the question being
asked, rather than composing more general tools that happen to also
answer it, is a real, everyday instance of algorithmic efficiency: `MaxBy`
finds an extreme value in one pass, remembering only the best candidate
seen so far, while sorting the entire sequence first does strictly more
work to answer the same narrower question. Also recognized in: finding the
tallest person in a room by walking through once and remembering the
tallest seen so far, rather than lining everyone up by height first; a
search engine returning just the top result without first fully ranking
every page on the internet; a thermostat tracking only the current
highest recorded temperature of the day, not the complete sorted history
of every reading.

### SE Lens

The previous Concept Unit's `OrderByDescending().FirstOrDefault()` was not
a mistake — it was a real, working, correct answer, reached by combining
two already-familiar tools before a more specific one was introduced. That
sequencing is deliberate: seeing the more general (if less efficient)
approach first makes `MaxBy`'s own value legible — it isn't "a different
way to do the same thing," it's "the same idea, with the unnecessary
sorting work removed," a distinction that would be far less visible if
this lesson had started with `MaxBy` and never shown what it's actually
saving. The real tradeoff of moving to `MaxBy`: a reader unfamiliar with
it might not immediately guess what it does from its name alone, the way
`OrderByDescending().FirstOrDefault()`'s two-part chain narrates its own
logic more explicitly, one step at a time.

### Commands Needed

- `dotnet new console -n ScratchNewestFileCheck` — scaffolds this unit's
  own throwaway proof project.
- `dotnet run` — runs it, producing the real output quoted above.

### Run It

Shown above, in full, as real captured output — not predicted, since
whether two different LINQ methods genuinely agree on the same real
result, and what a genuinely empty sequence produces, are exactly the
kind of claims this curriculum's own schema requires proof for, not
confident description.

### Connecting Back

`FindNewest` is now complete, using the more direct of the two tools this
lesson introduced. The final Concept Unit calls it for real, from
`MainWindow`, and shows its answer on screen.

---

## Concept Unit: Wiring the Resolver Into `MainWindow`

### The Problem

`NewestFileResolver` can answer "which file is newest," but nothing in
`MainWindow` asks it yet, and nothing on screen shows the answer. This
project already scans a folder and lists every file found in it — the one
piece still missing is picking out which single one matters most, and
saying so.

> `FindNewest` can return `null`, if the scanned folder had no XML files
> in it at all. Given the `if (folder != null)` pattern already proven
> safe for a nullable `string` earlier in this project, would the
> identical shape — checking for `null` before trusting a value — work
> just as well for a nullable `InputFile`? What should the UI honestly
> say in the case where there's genuinely no newest file to report?

### Introduce the Concept in Isolation

No new isolated example — checking a nullable value with `if`/`else` is
the same construct this project has already used for a nullable `string`,
applied here to a nullable `InputFile` instead; the only genuinely new
piece, the **`else` clause** (Header above), is small enough, and
predictable enough, that real project code is proof enough on its own,
without a separate throwaway version first.

### Discard the Throwaway Example

Not applicable — no new throwaway example was written for this unit.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — modified: `MainWindow.xaml` (a new `TextBlock`)
  and `MainWindow.xaml.cs` (a new field and additional
  `BrowseButton_Click` logic).
- **Change type** — add.
- **Location** — `MainWindow.xaml`: inside the outer vertical
  `StackPanel`, between the files-found count and the `ListBox`.
  `MainWindow.xaml.cs`: the field list, and the end of
  `BrowseButton_Click`, after an earlier lesson's files-found line.
- **Dependencies** — this lesson's completed `NewestFileResolver`.

### The New Code

`MainWindow.xaml`'s new element:

```xml
<TextBlock x:Name="NewestFileText" Text="Newest file: (none)"/>
```

`MainWindow.xaml.cs`'s new field:

```csharp
private readonly NewestFileResolver _newestFileResolver = new NewestFileResolver();
```

`BrowseButton_Click`'s new lines, added after an earlier lesson's
files-found line:

```csharp
InputFile? newestFile = _newestFileResolver.FindNewest(discoveredFiles);
if (newestFile != null)
{
    NewestFileText.Text = $"Newest file: {newestFile.FileName} (Modified: {newestFile.LastModified})";
}
else
{
    NewestFileText.Text = "Newest file: (none)";
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
12             <TextBlock x:Name="FilesFoundText" Text="Files Found: 0"/>
13             <TextBlock x:Name="NewestFileText" Text="Newest file: (none)"/>   // ← new
14             <ListBox x:Name="DiscoveredFilesListBox"/>
15         </StackPanel>
16     </Grid>
17 </Window>
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
17     private readonly DirectoryScanner _directoryScanner = new DirectoryScanner();
18     private readonly NewestFileResolver _newestFileResolver = new NewestFileResolver();  // ← new
19 
20     public MainWindow()
21     {
22         InitializeComponent();
23     }
24 
25     private void BrowseButton_Click(object sender, RoutedEventArgs e)
26     {
27         string? folder = _fileSource.SelectDirectory();
28         if (folder != null)
29         {
30             FolderPathText.Text = folder;
31 
32             List<InputFile> discoveredFiles = _directoryScanner.ScanDirectory(folder);
33             DiscoveredFilesListBox.Items.Clear();
34             foreach (var file in discoveredFiles)
35             {
36                 DiscoveredFilesListBox.Items.Add($"{file.FileName} — {file.LastModified}");
37             }
38             FilesFoundText.Text = $"Files Found: {discoveredFiles.Count}";
39 
40             InputFile? newestFile = _newestFileResolver.FindNewest(discoveredFiles);          // ← new
41             if (newestFile != null)                                                            // ← new
42             {                                                                                   // ← new
43                 NewestFileText.Text = $"Newest file: {newestFile.FileName} (Modified: {newestFile.LastModified})";  // ← new
44             }                                                                                   // ← new
45             else                                                                                // ← new
46             {                                                                                   // ← new
47                 NewestFileText.Text = "Newest file: (none)";                                    // ← new
48             }                                                                                   // ← new
49         }
50     }
51 }
```

`BrowseButton_Click` now performs the complete operation this project's
own outline described: scan, list every file, count them, and identify —
and honestly report — whichever one is newest.

### Mechanical Walkthrough

1. `<TextBlock x:Name="NewestFileText" Text="Newest file: (none)"/>`
   (XAML) — a **`TextBlock`** with an **`x:Name` directive** (both already
   fully explained in an earlier lesson), starting with the same honest
   "nothing yet" text this lesson's `else` branch also produces.
2. `private readonly NewestFileResolver _newestFileResolver = new
   NewestFileResolver();` (C#) — the identical field pattern already
   established twice over for `_fileSource` and `_directoryScanner`.
3. `InputFile? newestFile = _newestFileResolver.FindNewest
   (discoveredFiles);` (C#) — calls this lesson's own `FindNewest`
   through the field just added, passing `discoveredFiles` — the exact
   `List<InputFile>` an earlier lesson's `DirectoryScanner` already
   produced, accepted here as an `IEnumerable<InputFile>` with no
   conversion needed, per this lesson's first Concept Unit.
4. `if (newestFile != null)` (C#) — the **`if` statement** with the
   **inequality operator** `!=` (both already fully explained in an
   earlier lesson), checking whether a real file was found.
5. `NewestFileText.Text = $"Newest file: {newestFile.FileName}
   (Modified: {newestFile.LastModified})";` (C#) — inside the `if`
   branch: `TextBlock.Text` (already fully explained) is set from a
   **string interpolation** (already fully explained), reading the found
   file's `FileName` and `LastModified` properties (both generated by an
   earlier lesson's `InputFile` record).
6. `else` (C#) — the **`else` clause** (Header above): runs exactly when
   the `if`'s own condition was `false` — here, when `discoveredFiles` had
   no elements at all, and `FindNewest` genuinely had nothing to report.
7. `NewestFileText.Text = "Newest file: (none)";` (C#) — the honest,
   explicit fallback text, rather than leaving the field showing whatever
   a previous, different folder's scan happened to display.

### CS Lens

Handling both the "found something" and "found nothing" branches
explicitly, with the `else` clause stating the empty case in so many
words, is the same **defensive handling of a multi-valued type** an
earlier lesson already named for `bool?`'s three real outcomes, applied
here to a nullable reference type's two: `newestFile`'s two real
possibilities (a real file, or nothing) are both handled by name, with no
case silently falling through unaddressed. Also recognized in: a search
results page explicitly showing "No results found" rather than a blank
area that looks like a bug; a bank balance display explicitly showing
"$0.00" rather than leaving the field empty; a form's validation
explicitly stating "This field is required" rather than silently
rejecting a submission with no explanation.

### SE Lens

The alternative — leaving `NewestFileText` showing whatever leftover
text an earlier folder's scan produced, and only ever updating it inside
the `if (newestFile != null)` branch — was available, and would work for
every folder that actually contains XML files. It fails silently on an
empty one: a user scanning a folder with none would see a stale,
misleading answer from the previous folder they scanned, with nothing
about the screen indicating it's wrong. Writing the `else` branch costs
one small, explicit block of code; the alternative costs a real, if
subtle, correctness bug that would only surface for a specific, easy to
overlook case — exactly the kind of gap this curriculum's own explicit
handling of `null` throughout has tried to make into a habit rather than
an afterthought.

### Commands Needed

None beyond this lesson's one shared `dotnet build`, run once, covering
every Concept Unit's changes together — shown next.

### Run It

Real, captured output from running `dotnet build` against this lesson's
complete, final `NewestFileResolver.cs`, `MainWindow.xaml`, and
`MainWindow.xaml.cs` (.NET SDK 10.0.301), unedited:

```
Determining projects to restore...
All projects are up-to-date for restore.
MastercamGenerator -> <project>\bin\Debug\net10.0-windows\MastercamGenerator.dll

Build succeeded.
    0 Warning(s)
    0 Error(s)

Time Elapsed 00:00:01.77
```

This one real build covers every Concept Unit in this lesson at once — the
new `NewestFileResolver` class, its `IEnumerable<T>`-based signature, its
`MaxBy`-based implementation, and this unit's own `MainWindow` wiring all
compiled together, in a single pass, per this curriculum's own batching
practice.

### Connecting Back

Every earlier Concept Unit in this lesson built one piece of a chain this
unit finally shows on screen: a narrow, interface-based contract (first
unit) let this class accept whatever `DirectoryScanner` produces without
coupling to it directly; a lambda expression (second unit) told LINQ
exactly what to compare files by; `MaxBy` (third unit) found the answer
more directly than the first working version did. This unit is what
actually asks the question, for real, on every scan, and — per this
lesson's own `if`/`else` — tells the truth about it either way.

---

## Connect the Pieces

Trace one real folder scan, containing several XML files with different
modification times, through every piece this lesson built:

1. `BrowseButton_Click` scans the folder (an earlier lesson's own logic),
   producing a real `List<InputFile>`, `discoveredFiles`, with more than
   one entry.
2. `_newestFileResolver.FindNewest(discoveredFiles)` (this lesson's fifth
   Concept Unit) is called. `discoveredFiles`, a `List<InputFile>`, is
   accepted as an `IEnumerable<InputFile>` (first Concept Unit) with no
   conversion at all.
3. Inside `FindNewest` (fourth Concept Unit): `MaxBy(file =>
   file.LastModified)` walks every file exactly once, comparing each
   one's `LastModified` (read via the lambda expression from this
   lesson's second Concept Unit) against the best one seen so far, and
   returns the single file with the latest timestamp — proven, in this
   lesson's third Concept Unit, to agree with the slower
   `OrderByDescending().FirstOrDefault()` approach on the same real data.
4. Back in `BrowseButton_Click`, `newestFile` holds that real `InputFile`.
   `if (newestFile != null)` (fifth Concept Unit) evaluates `true`, and
   `NewestFileText.Text` is set to a real string naming the newest file
   and its real modification time.
5. If the exact same folder had instead contained zero XML files,
   `discoveredFiles` would be empty, `MaxBy` would return `null` — proven
   for real, on an empty sequence, in this lesson's third Concept Unit —
   and the `else` branch would set `NewestFileText.Text` to the honest
   "Newest file: (none)," rather than silently showing stale information
   from whatever folder was scanned before it.

The window now answers the exact question this lesson opened with: not
just "what files are here," which an earlier lesson already solved, but
"which one, out of everything found, actually matters right now" — the
first time this project has reduced a whole collection down to a single,
considered answer.
