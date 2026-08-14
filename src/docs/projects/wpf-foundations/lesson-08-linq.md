# Lesson 08: LINQ — `Where`, `Select`, and Deferred Execution

**What you will build:** a throwaway `List<Item>` filtered and
transformed with LINQ, proving `Where`/`Select` are ordinary methods
accepting `Func<>` parameters (Lesson 06's exact mechanism) — and a
second proof exposing LINQ's one real timing gotcha: a query doesn't run
when it's written, only when something actually asks for its results.

**What you need to know first:** [Lesson 06](lesson-06-delegates-func-action.md)
(`Func<>`, methods accepting delegates as parameters) and this
codebase's own prior treatment of `List<T>` from the Android/Kotlin
curriculum.

**Terms introduced in this lesson:**
- **LINQ (Language Integrated Query)** — a set of query methods
  (`Where`, `Select`, `OrderBy`, and others) usable over any collection,
  the rough equivalent of Python's `filter`/`map`/`sorted` as real
  methods instead of separate built-in functions.
- **Deferred execution** — a LINQ query describes work to do but doesn't
  actually run it until something enumerates the result (a `foreach`, a
  `.ToList()`).

**Objects and methods used:**

**`System.Linq.Enumerable.Where<T>`**
- *What it is:* the real static method backing every `.Where(...)` call
  on a `List<T>` or any other enumerable collection.
- *Implementation:* `public static IEnumerable<TSource> Where<TSource>(
  this IEnumerable<TSource> source, Func<TSource, bool> predicate)` —
  its real declared signature, confirmed against the .NET
  `System.Linq.Enumerable` documentation.
- *Its use:* filters a collection, keeping only elements the supplied
  `Func<TSource, bool>` returns `true` for — the method this lesson's
  first unit calls directly, via the shorter `.Where(...)` extension
  syntax explained inline below.

---

## Concept Unit: `Where` and `Select` Are Ordinary Methods

### The Problem

Filtering and transforming a collection by hand — a `foreach` loop
building up a new `List<T>` one matching element at a time — is real,
correct, repetitive code, written from scratch every single time it's
needed. Is there a built-in way to express "keep only the matching
elements" or "transform every element" as a single call, the way
Python's `filter`/`map` do?

### Introduce the Concept in Isolation

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

public class Item
{
    public string Name { get; set; } = "";
    public decimal Value { get; set; }
}

public class Program
{
    public static void Main()
    {
        var items = new List<Item>
        {
            new Item { Name = "Drill", Value = 89.99m },
            new Item { Name = "Level", Value = 24.50m },
            new Item { Name = "Hammer", Value = 15.00m },
        };

        var expensive = items.Where(i => i.Value > 50);
        foreach (var item in expensive)
            Console.WriteLine(item.Name);

        var names = items.Select(i => i.Name);
        foreach (var name in names)
            Console.WriteLine(name);
    }
}
```

Output:
```
Drill
Drill
Level
Hammer
```

`items.Where(i => i.Value > 50)` — `Where` filters `items` down to only
the elements matching a condition, keeping just `"Drill"` here (`89.99 >
50`), which the first `foreach` printed. `items.Select(i => i.Name)` —
`Select` transforms every element into something else — here, from a
full `Item` down to just its `Name` string — printing all three names in
the second loop, unfiltered. `using System.Linq;` — **first appearance**,
required for `.Where`/`.Select` to be callable at all; without it,
`items.Where(...)` would fail to compile with the exact "type or
namespace could not be found"-shaped error Lesson 01 already proved for
a missing `using`.

**What this actually is, not just what it does:** `items.Where(i =>
i.Value > 50)` looks like `Where` is a method belonging to `List<T>`
itself, but it is not — `List<T>` never declares a `Where` method
anywhere. `Where` is a real `static` method,
`System.Linq.Enumerable.Where<TSource>(IEnumerable<TSource> source,
Func<TSource, bool> predicate)` (confirmed above, in this lesson's
Header), and `items.Where(...)` is an **extension method** call —
special C# syntax letting a `static` method taking a first parameter of
some type be *called* as if it were an instance method on that type.
`items.Where(i => i.Value > 50)` is really
`Enumerable.Where(items, i => i.Value > 50)`, rewritten by the compiler
into the more readable dot-call form. The `i => i.Value > 50` argument is
a plain lambda satisfying `Func<TSource, bool>` — exactly Lesson 06's
own `Func<>` mechanism, not a new kind of syntax LINQ invented for
itself.

### Discard

This `items`/`expensive`/`names` example is deleted; the exercises below
build fresh, small variations without needing this exact list preserved.

### Mechanical Walkthrough

- `class Item { public string Name { get; set; } = ""; public decimal
  Value { get; set; } }` — **(b) hard concept reappearing**, ordinary
  auto-properties from Lesson 02, with a default value (`= ""`) on
  `Name` — **(a) first appearance** of a property initializer:
  guarantees `Name` starts as an empty string rather than `null`,
  satisfying the nullable-reference-type rules from Lesson 03 for a
  non-nullable `string` property with no constructor setting it
  explicitly.
- `new Item { Name = "Drill", Value = 89.99m }` — **(b) hard concept
  reappearing**, object initializer syntax from Lesson 04.
- `items.Where(i => i.Value > 50)` — **(a) first appearance** of the
  extension-method call syntax, explained above; `i => i.Value > 50` —
  **(b) hard concept reappearing**, an ordinary lambda (Lesson 05)
  satisfying `Func<Item, bool>` (Lesson 06), here comparing a `decimal`
  with `>` — **(c) already basic**, ordinary comparison.
- `foreach (var item in expensive)` — **(c) already basic**, ordinary
  `foreach`, already known.
- `items.Select(i => i.Name)` — **(a) first appearance** of `Select`
  itself (the transform operation), sharing every other piece of syntax
  already explained above for `Where`.

### CS Lens

Not a hard CS concept in the design-pattern sense — `Where`/`Select` are
real implementations of the general **filter**/**map** operations found
in nearly every language with any functional-programming influence:
Python's `filter(predicate, iterable)`/`map(func, iterable)`,
JavaScript's `array.filter(predicate)`/`array.map(func)`, and Kotlin's
own `.filter { }`/`.map { }` on any `List` — the same two operations,
under different names, appearing in every one of these because
"keep only matching elements" and "transform every element" are two of
the most common things any program does to a collection.

## Concept Unit: Deferred Execution — the One Real Timing Gotcha

### The Problem

`var expensive = items.Where(i => i.Value > 50);` in the previous unit
*looks* like it should immediately compute and store a filtered list at
that exact line — the same way `var doubled = list.Select(x => x * 2)`
looks like an immediate computation in most languages with `filter`/
`map`. Whether that assumption holds for LINQ specifically has to be
proven.

### Introduce the Concept in Isolation

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

public class Program
{
    public static void Main()
    {
        var numbers = new List<int> { 1, 2, 3 };

        var query = numbers.Where(n =>
        {
            Console.WriteLine($"Checking {n}");
            return n > 1;
        });

        Console.WriteLine("Query created, nothing checked yet.");

        foreach (var n in query)
            Console.WriteLine($"Matched: {n}");
    }
}
```

Output:
```
Query created, nothing checked yet.
Checking 1
Matched: 2
Checking 2
Matched: 2
Checking 3
Matched: 3
```

**"Query created, nothing checked yet." prints before any "Checking"
line** — direct, provable proof that `numbers.Where(...)` on its own did
**not** actually run the lambda against any element yet. The lambda
(with a `Console.WriteLine` planted inside it specifically to make its
execution visible) only starts running once the `foreach` loop begins
actually pulling elements out of `query`, one at a time — this is called
**deferred execution**: a LINQ query describes work to do, and that work
only actually happens when something enumerates the result.

### Discard

This `numbers`/`query` example is deleted — it exists only to make
deferred execution's timing directly observable.

### Mechanical Walkthrough

- `var query = numbers.Where(n => { Console.WriteLine(...); return n >
  1; });` — **(b) hard concept reappearing**, `Where` and the lambda
  mechanism already explained; the block-body lambda form (`{ }`, an
  explicit `return`) — **(b) hard concept reappearing** from Lesson 05,
  used here specifically so a `Console.WriteLine` can be planted inside
  the predicate itself, making its execution timing observable.
- `Console.WriteLine("Query created, nothing checked yet.");` — **(c)
  already basic**; its real *position* in the output (before every
  "Checking" line) is this unit's entire proof.
- `foreach (var n in query)` — **(c) already basic** as syntax; what it
  actually triggers — the delayed execution of every `Where` lambda,
  one element at a time, interleaved with the loop body's own
  `Console.WriteLine` — is the mechanism this whole unit exists to make
  visible.

### Execution Trace

1. `numbers.Where(n => {...})` runs. **Nothing inside the lambda
   executes.** `Where` itself only builds and returns a description of
   the query — an object that knows *how* to filter `numbers` once
   asked, not the filtered results themselves.
2. `Console.WriteLine("Query created...")` runs — proving step 1 truly
   did no filtering yet, since this line prints before any `"Checking"`
   text exists.
3. `foreach (var n in query)` begins. On its first pull, it asks `query`
   for its first matching element. `query` runs the lambda against `1`:
   prints `Checking 1`, evaluates `1 > 1` → `false` → `1` is skipped,
   not yielded.
4. Still finding a first result, `query` runs the lambda against `2`:
   prints `Checking 2`, evaluates `2 > 1` → `true` → `2` is yielded back
   to the `foreach`. The loop body runs: prints `Matched: 2`.
5. The loop asks for the *next* element. `query` resumes exactly where
   it left off (at `3`), runs the lambda against `3`: prints
   `Checking 3`, evaluates `3 > 1` → `true` → `3` is yielded. The loop
   body runs: prints `Matched: 3`.
6. No elements remain in `numbers`; the loop ends.

Note the real output shows `Checking 1` then `Matched: 2` — **not**
`Checking 1`, `Checking 2`, `Checking 3`, then all matches — direct proof
the checking and matching are genuinely interleaved, one element fully
processed at a time, rather than the whole collection being filtered
upfront before the loop ever starts.

### SE Lens

The real alternative — a method that filters eagerly, building and
returning a complete `List<T>` the instant it's called — is simpler to
reason about at a glance, at a real cost: it does the filtering work
even if the caller only ever needed the first matching element (a common
real case: "find the first negative balance," not "find every negative
balance"), and it can't be composed cheaply — chaining `.Where(...)
.Select(...).Where(...)` eagerly would build a full intermediate list at
every single step. Deferred execution's real cost: the timing is
genuinely less obvious from a quick read (proven directly by this unit's
own trace), and a query re-enumerated twice re-runs its lambdas twice,
including any side effects inside them — a real, provable trap
worth knowing before assuming a LINQ query behaves like a cached result.

## Connect the pieces

One trace: `Where`/`Select` are real `static` extension methods (not
`List<T>` members), accepting lambdas as `Func<>` parameters — Lesson
06's exact mechanism, recognized here in its most common real form.
Assigning a query to a variable (`var query = numbers.Where(...)`) does
not run it; only enumerating it (a `foreach`, or an explicit `.ToList()`)
actually pulls elements through, one at a time, running each lambda
exactly when — and only when — a result is actually being asked for.

## What breaks without this

Enumerate the same deferred query twice, expecting the second pass to be
"free" since the first one already ran:

```csharp
var query = numbers.Where(n => { Console.WriteLine($"Checking {n}"); return n > 1; });
foreach (var n in query) { }
Console.WriteLine("--- second pass ---");
foreach (var n in query) { }
```

Real output:
```
Checking 1
Checking 2
Checking 3
--- second pass ---
Checking 1
Checking 2
Checking 3
```

Every `"Checking"` line prints **twice** — proof that `query` was never
a cached, computed result at all; it's a re-runnable description of work,
and every fresh enumeration re-executes the lambda against every element
from scratch. Calling `.ToList()` once, immediately after building the
query, and enumerating *that* list twice instead would only run the
lambdas once — the real, common fix once this behavior is understood.

## Exercises

1. Chain `.Where(...)` and `.Select(...)` together in one expression
   (`items.Where(i => i.Value > 20).Select(i => i.Name)`), and confirm,
   with a planted `Console.WriteLine` inside each lambda, that they
   still only run once elements are actually enumerated — not the moment
   the chained expression is written.
2. Add `.ToList()` to the end of a `Where` query immediately after
   building it, then enumerate the resulting list twice with two
   separate `foreach` loops. Confirm, using the same planted
   `Console.WriteLine` trick, that the underlying `Where` lambda now
   only runs once total, not once per enumeration.

## Definition of Done

- [ ] You compiled and ran the `Where`/`Select` example and understood
      both as ordinary extension-method calls taking `Func<>` arguments.
- [ ] You compiled and ran the deferred-execution proof and can explain,
      from the real output's actual ordering, why "Query created..."
      printing before any "Checking" line matters.
- [ ] You reproduced the double-enumeration trap and understood why
      `.ToList()` fixes it.
- [ ] You completed both exercises and observed the described behavior
      yourself.

## Arc 1 complete

Every construct a Java/Kotlin developer needs before touching real WPF
code — properties, value vs. reference semantics, lambdas, delegates,
`event`, LINQ — now has full, isolated, proven treatment. Lesson 09
(`../wpf-lessons/lesson-01-a-window-is-a-class-split-in-two.md`, see this
series' [README](README.md)) starts Arc 2: WPF itself.
