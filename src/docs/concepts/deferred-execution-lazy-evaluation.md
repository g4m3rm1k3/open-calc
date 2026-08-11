# Concept: Deferred Execution / Lazy Evaluation

**What you'll understand by the end:** why a declared computation — a query, a generator — doesn't necessarily run the moment it's written, why it can instead run later, when something actually asks for its results, and why that gap between "declared" and "actually run" means the exact same declared computation can genuinely produce a different answer each time it's asked, if the data it depends on changed in between.

**Prerequisites:** a language with first-class functions/lambdas and some notion of iterating a sequence (a `foreach`/`for...of`/`for` loop), in any language.

## Setup

```
dotnet new console -o lab-deferred
cd lab-deferred
```

Replace the generated `Program.cs`'s contents with the example below. This file's own example uses C#'s LINQ purely as one real, concrete vehicle for the idea — nothing about this file's own point is specific to C# or LINQ.

## The Problem

Most code runs the moment it's written: a line executes, in order, top to bottom. A query or generator built out of `Where`/`Select`-style transformations *looks* like it should work the same way — assigning it to a variable feels like it should capture the matching results right then, the same way running a loop and building a list genuinely does. Whether that assumption is actually true is worth checking directly, because if it's wrong in a way that isn't obvious from reading the code, a value can silently keep changing out from under whatever's holding onto it.

## The Isolated Example

```csharp
List<int> numbers = new List<int> { 1, 2, 3 };

IEnumerable<int> doubled = numbers.Select(n => n * 2);

Console.WriteLine("Before adding to the list:");
foreach (int n in doubled)
{
    Console.WriteLine($"  {n}");
}

numbers.Add(4);

Console.WriteLine("After adding 4 to the list (query never re-run manually):");
foreach (int n in doubled)
{
    Console.WriteLine($"  {n}");
}
```

Run it:

```
dotnet run
```

**Real output:**

```
Before adding to the list:
  2
  4
  6
After adding 4 to the list (query never re-run manually):
  2
  4
  6
  8
```

**What this proves:** `doubled` was assigned exactly once, from `numbers.Select(...)`, *before* `4` was ever added to `numbers` — and yet the second `foreach` over that same, never-reassigned `doubled` variable includes the new value's double, `8`. `Select` did not run at the point it was written; it ran again, for real, each time `doubled` was enumerated, reading whatever `numbers` actually contained *at that exact moment*.

Now contrast this with forcing the same query to run immediately, once, instead:

```csharp
List<int> numbers2 = new List<int> { 1, 2, 3 };
List<int> materialized = numbers2.Select(n => n * 2).ToList();

Console.WriteLine("Before adding to the list:");
foreach (int n in materialized)
{
    Console.WriteLine($"  {n}");
}

numbers2.Add(4);

Console.WriteLine("After adding 4 to the list (materialized with .ToList()):");
foreach (int n in materialized)
{
    Console.WriteLine($"  {n}");
}
```

**Real output:**

```
Before adding to the list:
  2
  4
  6
After adding 4 to the list (materialized with .ToList()):
  2
  4
  6
```

**What this proves:** `.ToList()` forces the query to actually run immediately, once, producing a real, independent `List<int>` completely disconnected from `numbers2` from that point on — adding `4` to `numbers2` afterward has no effect on `materialized` at all, unlike `doubled` above.

## Mechanical Walkthrough

- `IEnumerable<int> doubled = numbers.Select(n => n * 2);` — builds a real query *object*, but does not run it — `Select` describes *how* to transform each item, not the transformed result itself. The declared type, `IEnumerable<int>` rather than a concrete `List<int>`, is itself a visible signal that this isn't an already-computed collection.
- The first `foreach (int n in doubled)` is what actually triggers the query to run, for the first time — walking `numbers`'s contents *as they are at that exact moment* and applying `n => n * 2` to each.
- `numbers.Add(4)` mutates the original list; `doubled` itself is never touched or reassigned — nothing in this line even mentions `doubled`.
- The second `foreach (int n in doubled)` runs the *same* query object *again*, from scratch, against `numbers`'s new, current contents — now including the doubled form of `4`.
- `.ToList()` is what actually breaks that connection: it forces the query to run immediately, once, and copies the real results into a genuinely new, independent `List<int>` — after that point, nothing about the original `numbers2` variable is connected to `materialized` at all.

## Execution Trace

1. `numbers.Select(n => n * 2)` is called — builds and returns a query object; no transformation has actually happened to any element yet.
2. `doubled` now holds that query object — a *description* of a computation, not a computed result.
3. The first `foreach` enumerates `doubled` — only *now* does `Select`'s lambda actually run, once per current element of `numbers` (`1`, `2`, `3`), producing `2`, `4`, `6`.
4. `numbers.Add(4)` changes the real, underlying list `doubled` reads from — `doubled` itself holds no snapshot of the old contents, because it was never asked to produce one.
5. The second `foreach` enumerates `doubled` again — `Select`'s lambda runs a second time, against `numbers`'s current four elements (`1`, `2`, `3`, `4`), producing `2`, `4`, `6`, `8` — a genuinely different result from step 3's, from the exact same, never-reassigned `doubled` variable.

## CS Lens

This is called **deferred execution** (also known as **lazy evaluation**): a declared computation doesn't run until something actually asks for its result, and if asked more than once, it can genuinely run more than once, each time against whatever the world looks like *right then*. The opposite — **eager evaluation** — runs the computation immediately, once, at the point it's declared, producing a fixed, already-computed value from that point on (exactly what `.ToList()` forces above).

Also recognized in: **Python generator functions** (`def gen(): yield x`) — no code inside a generator function's body runs until the first value is actually requested from it, the identical deferred idea; worth one precise distinction, though, verified directly rather than assumed: a single Python **generator object** can only be iterated once before it's exhausted (unlike this file's own `doubled`, a LINQ query object, which can be enumerated repeatedly) — calling the generator *function* again, producing a fresh generator object each time, is the closer equivalent to this file's own two separate `foreach` passes. **JavaScript generator functions** (`function* gen() { yield x; }`) behave identically to Python's in both respects — deferred until first requested, and a single generator object exhausted after one full iteration. **Haskell's laziness** takes the same idea further still, applying it by default to nearly every value in the language, not just sequences built from an explicit generator/query syntax — an unevaluated expression sits inert until something actually forces it to produce a real value.

## SE Lens

Why does a language design a query or generator this way, instead of always eagerly computing a result the moment it's declared? Genuine efficiency is the main case for it: a query filtered down to a tiny fraction of a huge, expensive-to-produce source — and then never actually enumerated, because some earlier check made it unnecessary — costs almost nothing under deferred execution, since the expensive work never runs at all; eager evaluation would have already paid that cost regardless of whether the result was ever used. The real cost runs the opposite direction: a query or generator held across a point in code where its underlying source might change can silently reflect that change later, surprising anyone who assumed — reasonably, based on how an ordinary variable behaves — that assigning it once meant it was fixed from that point on. Recognizing which situation applies, and reaching for an explicit "materialize now" step (`.ToList()`, calling the generator function again for a fresh pass, or the equivalent in whatever language is in play) the moment a fixed snapshot is actually what's needed, is the real, practical skill this distinction is worth understanding for.

## Connection

Builds on ordinary iteration (a `foreach`/`for...of`/`for` loop) and first-class functions/lambdas. Directly relevant any time a query, generator, or similarly "declared but not yet run" value is held in a variable across a point in code where the data it depends on might change — recognizing that gap is what decides whether a later read reflects the original data or the current data.

## Try It Yourself

1. Build a query with two chained transformations (`numbers.Where(n => n > 1).Select(n => n * 10)`), enumerate it once, mutate the source list, enumerate it again, and confirm — with real output — the second pass reflects the mutation, exactly like this file's own single-`Select` example.
2. Predict, before running it, whether calling `.ToList()` *twice* on the same un-materialized query variable (`var q = numbers.Select(...); var a = q.ToList(); numbers.Add(...); var b = q.ToList();`) produces two identical lists or two different ones — then run it and check your prediction against the real result.
3. In Python, write a generator function, iterate a generator object it returns to exhaustion, then try iterating that *same* object a second time — confirm it now produces nothing at all, and explain, in your own words, why that's a genuinely different behavior from this file's own `doubled` (a LINQ query object), which can be enumerated as many times as asked.
