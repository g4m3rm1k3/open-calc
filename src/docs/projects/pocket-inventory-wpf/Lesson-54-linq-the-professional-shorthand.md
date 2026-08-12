# Lesson 54: The Loop You've Already Written, By Hand, Fifty Times

*(LINQ — `Where`, `Select`, deferred execution)*

**User Story**
> As the developer maintaining Pocket Inventory, I want the shorthand
> professional C# code actually uses for the filter/transform/aggregate
> loops this project has hand-written since Lesson 19 — now that I
> understand exactly what those loops do, by hand, well enough to
> recognize the shortcut for what it is.

**What you will build**
This project has deliberately avoided LINQ in its own real code since
Lesson 21 — hand-rolled `foreach`/`if` loops, on purpose, so the
underlying mechanics were never hidden behind a method call. Every one
of those loops has a direct LINQ equivalent. This lesson proves several
of them produce byte-identical real output to the hand-rolled versions
already trusted, names LINQ's real building blocks, and converts one
small, real piece of the project — Lesson 37's print filter — as a
worked example.

**What you need to know first:** Lesson 19: `Predicate<T>`,
`ICollectionView.Filter`. Lesson 20: `&&`-composed filtering, by hand.

**Terms introduced in this lesson:**
- **LINQ** (Language Integrated Query) — a set of built-in extension
  methods (`Where`, `Select`, `OrderBy`, and others) providing a
  standard shorthand for the filter/transform/sort loops this project
  has hand-written since Lesson 19.
- **Deferred execution** — a LINQ query built with `Where`/`Select`
  doesn't actually run when it's written — it runs each time it's
  enumerated (a `foreach`, or a method like `.ToList()`), re-reading
  whatever the source collection contains *at that moment*.

**Objects and methods used**
- **`.Where(predicate)`**
  - *What it is:* a LINQ extension method that filters a sequence,
    keeping only the elements for which a given condition returns
    `true` — the shorthand for a `foreach` with an `if` check inside it.
  - *Implementation:* an extension method on `IEnumerable<T>`, taking a
    lambda (`i => i.Category == "Tools"`) and returning a new,
    unmaterialized sequence — nothing is actually filtered until that
    sequence is enumerated.
  - *Its use:* proven, against Lesson 20's own hand-rolled
    `Matches`/`PrintMatches` loop, to produce byte-identical real
    output; later replaces `viewModel.Items`' manual archived-item
    filter in Lesson 37's print feature.
- **`.Select(transform)`**
  - *What it is:* a LINQ extension method that transforms each element
    of a sequence into something else, one at a time — the shorthand
    for a `foreach` loop that builds up a new list from an old one.
  - *Implementation:* an extension method on `IEnumerable<T>`, taking a
    lambda (`i => i.Name`) and returning a new, unmaterialized sequence
    of the transformed values.
  - *Its use:* chained directly after `.Where()`
    (`items.Where(...).Select(i => i.Name)`), reducing a full
    `InventoryItem` filter-then-extract-name loop to one line.
- **`.ToList()`**
  - *What it is:* forces a LINQ query to actually run right now,
    against the source collection's current contents, and copies the
    results into a real, independent `List<T>`.
  - *Implementation:* an extension method on `IEnumerable<T>`,
    enumerating the entire query and materializing every result.
  - *Its use:* this lesson's own real, contrasted proof of **deferred
    execution** — a query read *before* `.ToList()` sees a later
    addition to the source list; the identical query, materialized with
    `.ToList()` immediately, does not.
- **`IEnumerable<T>`**
  - *What it is:* the real return type of an unmaterialized LINQ query
    — represents "a sequence that can be enumerated," not a concrete,
    already-computed collection.
  - *Implementation:* the interface `.Where()`/`.Select()` both return;
    assigning their result to an `IEnumerable<T>` variable (rather than
    `List<T>`) keeps the query un-run until something actually
    enumerates it.
  - *Its use:* `IEnumerable<string> query = names.Where(...)`, this
    lesson's own real, direct proof that a LINQ query re-reads its
    source collection at enumeration time, not at the moment it's
    written.

**Everything else in the file, not this lesson's subject but still
explained**
- **`Predicate<T>`**
  - *What it is:* a delegate type representing "a method that takes a
    `T` and returns `bool`."
  - *Implementation:* full treatment already given in
    `Lesson-19-predicates-and-live-search.md`.
  - *Its use:* the hand-written filtering shape (`ICollectionView.Filter`)
    this lesson's `.Where()` is shown to be the professional shorthand
    for — pure language plumbing (lambdas, generic syntax) stays in
    Terms Introduced, not repeated here.

---

## Concept Unit: `.Where()` — The Filter Loop, Named and Reused

### The Problem

Lesson 20's own `Matches`/`PrintMatches` pattern — a `foreach` with an
`if` check inside it — is a real, correct way to filter a collection.
Worth checking directly whether professional C# code's own shorthand
for exactly that shape produces the identical real result.

### Introduce the Concept in Isolation
```bash
dotnet new console -o LinqLab
```

Replace `Program.cs`:

```csharp
List<(string Name, string Category, bool IsFavorite)> items = new()
{
    ("Hex Bolts", "Tools", true),
    ("Hammer", "Tools", false),
    ("USB Cable", "Electronics", true),
    ("Notebook", "Consumables", false)
};

Console.WriteLine("Hand-rolled foreach/if:");
List<string> byHand = new List<string>();
foreach (var item in items)
{
    if (item.Category == "Tools")
    {
        byHand.Add(item.Name);
    }
}
foreach (string name in byHand)
{
    Console.WriteLine($"  {name}");
}

Console.WriteLine("LINQ .Where():");
List<string> viaLinq = items.Where(i => i.Category == "Tools").Select(i => i.Name).ToList();
foreach (string name in viaLinq)
{
    Console.WriteLine($"  {name}");
}

Console.WriteLine($"Identical results: {byHand.SequenceEqual(viaLinq)}");
```

Run it:

```bash
dotnet run
```

Real output:

```text
Hand-rolled foreach/if:
  Hex Bolts
  Hammer
LINQ .Where():
  Hex Bolts
  Hammer
Identical results: True
```

#### Execution Trace

1. The hand-rolled version builds `byHand` exactly the way Lesson 20's
   own `Matches`-checking loop works: visit every item, keep the ones
   passing a real condition (`Category == "Tools"`), discard the rest.
2. `items.Where(i => i.Category == "Tools")` — the identical
   condition, expressed as a lambda (the same arrow syntax
   `RelayCommand`'s `execute`/`canExecute` delegates, Lesson 23, already
   used) instead of an `if` inside a loop body.
3. `.Select(i => i.Name)` — transforms each surviving item from the
   full tuple down to just its `Name`, the same transformation the
   hand-rolled loop performed via `byHand.Add(item.Name)`.
4. `.ToList()` — converts the LINQ query into a real, concrete
   `List<string>`, directly comparable to `byHand`.
5. `byHand.SequenceEqual(viaLinq)` — a real, element-by-element
   comparison — prints `True`: both approaches produced exactly the
   same two names, in the same order.

*What this proves:* `Where`/`Select`, chained together, produce the
identical real result to the hand-rolled `foreach`/`if` loop this
project has already trusted since Lesson 20 — proven directly, not
assumed, via a real `SequenceEqual` check. This is called **LINQ** —
`Where` is the filter step, `Select` is the transform step, and neither
does anything a hand-written loop couldn't already do.

### Discard the Throwaway Example
Keep `LinqLab` open — the next unit's own real, genuinely surprising
proof reuses this project.

### Mechanical Walkthrough

- `items.Where(i => i.Category == "Tools")` — **first appearance of
  `Where` used as real, working code in this project** (Lesson 19 only
  ever *named* it, in passing, as a comparison point). `i => ...` is a
  lambda — reappearing shape (`RelayCommand`'s `execute`, Lesson 23).
- `.Select(i => i.Name)` — **first appearance of `Select`.** Distinct
  from `Where`: `Where` decides which items survive; `Select` decides
  what each surviving item becomes.
- `SequenceEqual`, called on `byHand` — **first appearance.** A real,
  built-in LINQ method for comparing two sequences element by element —
  used here purely as this unit's own verification tool, not part of
  the "real" code being taught.

### CS Lens

`Where` and `Select` are themselves ordinary C# methods — real
**extension methods** (Lesson 1b) on `IEnumerable<T>`, not new language
syntax. `items.Where(...)` compiles to the exact same kind of call
`"   ".IsBlank()` (Lesson 1b's own extension method) did — a `static`
method, written by someone else, made callable with ordinary dot
syntax on a type it doesn't belong to.

### SE Lens

Why did this project deliberately avoid `Where`/`Select` in its own
real code for 33 lessons (Lesson 21 through Lesson 53), given they were
always available? Because using them before the underlying
filter/transform *mechanism* was fully, personally understood would
have meant trusting a method call's behavior instead of proving it —
directly against this course's own standing rule, restated every time a
`.Where()` or `.Select()` slipped into a throwaway lab by mistake
(Lesson 20's own real fix, this session). Now that the mechanism is
proven, by hand, dozens of times over, the shorthand is no longer
hiding anything unfamiliar.

### Connection

`Where`/`Select` look like they run immediately, top to bottom, the
same way a `foreach` loop does. The next unit proves that assumption
wrong, directly.

---

## Concept Unit: Deferred Execution — a LINQ Query Isn't a Snapshot

### The Problem

`items.Where(...)`, assigned to a variable, looks like it should
capture the matching items *at that moment* — the same way `byHand`,
the hand-rolled `List<string>` from the previous unit, genuinely is a
fixed snapshot the instant its loop finishes. Worth testing directly
whether a LINQ query actually behaves the same way.

### Introduce the Concept in Isolation

In the same `LinqLab` project, replace `Program.cs`:

```csharp
List<string> names = new List<string> { "Hammer", "Ladder" };

IEnumerable<string> query = names.Where(n => n.StartsWith("H"));

Console.WriteLine("Before adding to the list:");
foreach (string name in query)
{
    Console.WriteLine($"  {name}");
}

names.Add("Hex Bolts");

Console.WriteLine("After adding 'Hex Bolts' to the list (query never re-run manually):");
foreach (string name in query)
{
    Console.WriteLine($"  {name}");
}
```

Run it:

```bash
dotnet run
```

Real output:

```text
Before adding to the list:
  Hammer
After adding 'Hex Bolts' to the list (query never re-run manually):
  Hammer
  Hex Bolts
```

*What this proves:* `query` was assigned exactly once, from
`names.Where(...)`, before `"Hex Bolts"` was ever added — and yet the
*second* `foreach` over that same, never-reassigned `query` variable
includes it. `Where` did not run at the point it was written; it ran
again, for real, each time `query` was enumerated, reading whatever
`names` actually contained *at that moment*.

Now contrast this with forcing the query to run immediately:

```csharp
List<string> names = new List<string> { "Hammer", "Ladder" };

List<string> materialized = names.Where(n => n.StartsWith("H")).ToList();

Console.WriteLine("Before adding to the list:");
foreach (string name in materialized)
{
    Console.WriteLine($"  {name}");
}

names.Add("Hex Bolts");

Console.WriteLine("After adding 'Hex Bolts' to the list (materialized with .ToList()):");
foreach (string name in materialized)
{
    Console.WriteLine($"  {name}");
}
```

Real output:

```text
Before adding to the list:
  Hammer
After adding 'Hex Bolts' to the list (materialized with .ToList()):
  Hammer
```

#### Execution Trace

1. `IEnumerable<string> query = names.Where(...)` — builds a real
   query object, but does **not** run it yet — `Where` itself only
   describes *how* to filter, not the filtered result.
2. The first `foreach (string name in query)` genuinely runs the
   filter, for the first time, against `names`'s contents at that exact
   moment — `"Hammer"` only, since `"Ladder"` doesn't start with `"H"`.
3. `names.Add("Hex Bolts")` — mutates the original list; `query` itself
   is never touched or reassigned.
4. The second `foreach (string name in query)` runs the *same* filter
   *again*, against `names`'s new, current contents — now including
   `"Hex Bolts"`, which also starts with `"H"`.
5. In the contrasting version, `.ToList()` forces the filter to run
   immediately, once, producing a real, independent `List<string>` —
   `materialized` — completely disconnected from `names` from that
   point on. Adding `"Hex Bolts"` to `names` afterward has no effect on
   `materialized` at all.

*What this proves:* this is called **deferred execution** — a LINQ
query re-runs every time it's enumerated, against the source
collection's *current* contents, unless something forces it to run
immediately and produce a real, independent result (`.ToList()`,
proven here to genuinely freeze the result the moment it's called).
`deferred-execution-lazy-evaluation.md` covers this exact idea in full,
standalone, project-independent form — the same real, contrasting
`Select`/`.ToList()` proof shown there too, plus a CS Lens naming
Python's and JavaScript's own generator functions, and Haskell's
laziness, as other real, recognized instances of the identical
underlying idea.

### Discard the Throwaway Example
Delete the `LinqLab` folder. `Where`/`Select`/deferred execution are
not discarded — the real project uses `Where` next.

### Mechanical Walkthrough

- `IEnumerable<string> query = names.Where(...);` — **first appearance
  of holding an un-materialized LINQ query in a variable.** The type is
  `IEnumerable<string>`, not `List<string>` — a real, visible signal
  that this isn't a concrete, already-computed collection.
- Enumerating `query` twice, getting two different real results —
  **first appearance of deferred execution's actual, observable
  effect**, proven directly rather than described.
- `.ToList()` — reappearing exactly (this lesson's first unit already
  used it) — here specifically to force immediate execution, its second
  real purpose beyond "convert to a concrete list."

### CS Lens

Deferred execution is the real reason `Where`/`Select` never actually
copy the source collection — `names.Where(...)` doesn't build a new
list of matching items; it builds a small object that knows *how* to
walk `names` and test each item, only actually doing so when something
asks it to enumerate. This is genuinely efficient — filtering a huge
collection down to nothing, then never actually enumerating the
result, costs almost nothing — but it is also the real, structural
reason a LINQ query can silently reflect a source collection's changes
if you're not expecting it to.

### SE Lens

Why does this matter for a real WPF app specifically? Because a LINQ
query held across multiple lines of code — assigned once, used
later — can silently pick up changes made in between, exactly the way
this unit's own `query` variable did. `ICollectionView.Filter`
(Lesson 19) sidesteps this entirely by re-running its predicate
automatically, on its own, whenever the view needs to refresh — a
different mechanism achieving a similar live-updating effect on
purpose, not by an accident of deferred execution.

### Connection

Lesson 50's own architecture review flagged one small, real piece of
duplicated filtering logic — `PrintButton_Click`'s (Lesson 37) manual
`if (item.IsArchived) continue;`. `Where` replaces it next.

---

## Concept Unit: A Real, Small Refactor — `PrintButton_Click`

### The Problem

`PrintButton_Click` (Lesson 37) hand-rolls the exact "skip archived
items" filter `GroupedItems` (Lesson 28) already expresses, via its own
`foreach`/`if`/`continue` — a small, real duplication Lesson 50's own
capstone review named directly but left unfixed.

### Project Change

- **Reference Source:** `Lesson-37-flowdocument-and-printdialog.md`,
  the `foreach (InventoryItem item in viewModel.Items) { if
  (item.IsArchived) { continue; } ... }` block.
- **Files affected:** `InventoryPage.xaml.cs`.
- **Change type:** Refactor.
- **Dependencies:** `Where`, first unit.

### The New Code

```csharp
foreach (InventoryItem item in viewModel.Items.Where(i => !i.IsArchived))
{
    TableRow row = new TableRow();
    row.Cells.Add(new TableCell(new Paragraph(new Run(item.Name))));
    row.Cells.Add(new TableCell(new Paragraph(new Run(item.Category.ToString()))));
    row.Cells.Add(new TableCell(new Paragraph(new Run(item.Value.ToString("C")))));
    rowGroup.Rows.Add(row);
}
```

### The Updated Project

```csharp
foreach (InventoryItem item in viewModel.Items.Where(i => !i.IsArchived))  // ← changed
{                                                                           // ← changed (was: foreach (...Items) { if (item.IsArchived) { continue; }
    TableRow row = new TableRow();
    row.Cells.Add(new TableCell(new Paragraph(new Run(item.Name))));
    row.Cells.Add(new TableCell(new Paragraph(new Run(item.Category.ToString()))));
    row.Cells.Add(new TableCell(new Paragraph(new Run(item.Value.ToString("C")))));
    rowGroup.Rows.Add(row);
}
document.Blocks.Add(table);

PrintDialog printDialog = new PrintDialog();
if (printDialog.ShowDialog() == true)
{
    IDocumentPaginatorSource paginatorSource = document;
    printDialog.PrintDocument(paginatorSource.DocumentPaginator, "Pocket Inventory");
}
```

### Mechanical Walkthrough

- `viewModel.Items.Where(i => !i.IsArchived)` — replaces the manual
  `if (item.IsArchived) { continue; }` — the loop body itself,
  building each real `TableRow`, is completely unchanged; only *which*
  items the loop ever sees is different now.
- The loop is still a real `foreach` — **not** converted to
  `.Select(...).ToList()` or similar — because building a `TableRow`
  and adding it to `rowGroup.Rows` is a real, imperative *side effect*,
  not a value LINQ's own transformation methods are meant to produce.

### CS Lens

This is a deliberately partial conversion, and that's the honest,
correct choice: `Where` replaces exactly the part of the original loop
that was pure filtering, and leaves the part that was genuinely
building WPF UI objects — a real side effect — as an ordinary
`foreach`. LINQ is a real tool for the filter/transform/aggregate shape
specifically, not a mandate to eliminate every loop in a codebase.

### SE Lens

This is the concrete resolution to the exact finding Lesson 50's own
capstone named and explicitly chose not to fix at the time: duplicated
filtering logic, worth naming, not urgent enough to justify a mid-refactor
detour. Fixing it now, with the right tool finally in hand, is
what a *later*, deliberate pass over a named-but-deferred finding is
supposed to look like — not forgotten, not urgent, revisited on
purpose.

### Commands Needed

```bash
dotnet run
```

### Run It

On your Windows machine, apply this exact change to your own real
`PrintButton_Click`. Archive one real item, print, and confirm the
printed table still correctly excludes it — identical behavior to
before this lesson, now expressed in one line instead of four.

### Connection

This is the last new mechanic this course teaches. What remains is
what every real, maintained codebase eventually needs: revisiting
findings like this one, on purpose, the way this exact unit just did.

---

## Closing

### Connect the Pieces

The first unit's own real `SequenceEqual` proof — hand-rolled
`foreach`/`if` and `Where().Select()` producing byte-identical output —
established that LINQ is genuine shorthand, not new behavior. The
second unit's own, genuinely surprising real proof — the same `query`
variable returning different real results across two enumerations,
purely because `names` changed in between — is deferred execution,
real and directly observable, not just described. The third unit
applied both: `Where` replaced real, duplicated filtering logic in
`PrintButton_Click`, closing a finding this project's own Lesson 50
capstone named but deliberately left for later.

### What Breaks Without This

Already demonstrated directly, on purpose, in this lesson's second
unit: holding a LINQ query across a point where its source collection
changes, then trusting an earlier enumeration's result to still apply,
produces a real, silent surprise — `query`'s second enumeration
included `"Hex Bolts"` despite `query` itself never being reassigned.
`.ToList()`, called at the right moment, is the real, direct fix.

### Exercises

- In a fresh `LinqLab`, reproduce Lesson 31's `GROUP BY`-style category
  counts using `items.GroupBy(i => i.Category)` instead of hand-written
  grouping logic — confirm, with real output, the counts match.
- Predict, in your own words, whether `ICollectionView.Filter`
  (Lesson 19) is itself deferred in the same sense this lesson's own
  `query` variable was — then reread Lesson 19's own real proof and
  confirm or correct your prediction.
- Find one more real, small filter/transform loop anywhere in this
  project's own lesson files (search for `foreach` combined with an
  `if`/`continue` pattern) and convert it to `Where`/`Select` in a
  throwaway lab, confirming real, identical output before deciding
  whether it belongs in the real project too.

### Definition of Done

- [ ] You ran the hand-rolled-vs-`Where` comparison yourself and
      confirmed the real `SequenceEqual` result — not just read it
      here.
- [ ] You ran the deferred-execution lab yourself and saw, for real,
      the same query variable produce two different results across two
      enumerations.
- [ ] You applied the real `PrintButton_Click` refactor to your own
      project and confirmed printing still correctly excludes archived
      items.
- [ ] You can explain, in your own words and without re-reading this
      lesson, why this project waited until now to use `Where`/`Select`
      in its own real code, rather than from the beginning.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Replace PrintButton_Click's manual archived-item filter with LINQ Where"`.

---

Fifty-four lessons, six prepended concept lessons, and one capstone
later: every mechanic in this curriculum was proven the same way,
without exception — real code, run for real, read for real, never
assumed. That discipline was always the actual subject being taught.
