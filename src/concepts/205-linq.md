---
concept: 205-linq
name: LINQ (C#)
---

## Definition

LINQ (Language Integrated Query) lets you query and transform
collections using declarative, SQL-like syntax directly in C# — either as
"query syntax" (`from x in collection where ... select ...`) or "method
syntax" (`.Where(...).Select(...)`), both compiling down to the same
underlying operations.

## Problem

Filtering, transforming, and aggregating collections with manual loops
requires the same repetitive boilerplate (accumulator, loop, condition)
every time — see the equivalent problem in Java's Streams API or
Python's comprehensions. LINQ expresses these transformations
declaratively, chaining operations that describe WHAT result is wanted
rather than HOW to loop to get it.

## Execution

Method syntax chains `.Where()` and `.Select()` directly on a collection
↓
Query syntax expresses the SAME operation with `from`/`where`/`select`
keywords — compiles to the SAME method calls underneath
↓
LINQ is LAZY (deferred execution) — `Where` and `Select` build up a QUERY
DESCRIPTION but don't actually iterate the collection until something
enumerates the result (`ToList()`, `foreach`, etc.)
↓
The final materialized result contains only the squares of the even
numbers

## Computer Science

LINQ's query syntax is pure syntactic sugar that the compiler translates
into chained method calls (`Where`, `Select`) at compile time — both
syntaxes produce IDENTICAL compiled code, so the choice between them is
purely a matter of readability preference for a given query's shape.

Tags: Deferred execution, Query syntax vs method syntax, Compiler translation

## Software Engineering

LINQ's deferred execution means a query variable doesn't hold RESULTS, it
holds a DESCRIPTION of how to compute them — re-enumerating the same
query variable twice re-runs the ENTIRE query from scratch against the
current state of the source collection, which can surprise developers
expecting cached results.

Tags: Deferred execution gotchas, Re-enumeration, Query reuse

## Common Mistakes

- Assuming a LINQ query variable holds computed RESULTS rather than a description of the query — if the underlying collection changes between when the query is defined and when it's enumerated, the results reflect the LATEST state, not a snapshot from definition time.
- Calling `.ToList()` or `.Count()` repeatedly on the SAME unmaterialized query — each call re-runs the entire query pipeline; materializing once with `.ToList()` and reusing that list avoids redundant recomputation.

## Exercises

- Trace through what happens if you add an element to the source collection AFTER defining a query but BEFORE enumerating it (e.g., before calling `.ToList()`) — does the new element show up in the query's results?
- Rewrite the filter-square example using explicit `foreach` loop logic, and compare it against the LINQ method-syntax version for readability.

## csharp

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

var numbers = new List<int> { 1, 2, 3, 4, 5, 6 };

// Method syntax
var resultMethod = numbers.Where(n => n % 2 == 0).Select(n => n * n).ToList();
Console.WriteLine(string.Join(", ", resultMethod));

// Query syntax -- compiles to the SAME underlying method calls
var resultQuery = (from n in numbers where n % 2 == 0 select n * n).ToList();
Console.WriteLine(string.Join(", ", resultQuery));

Console.WriteLine(resultMethod.SequenceEqual(resultQuery));
```
Walkthrough: `resultMethod` (method syntax) and `resultQuery` (query
syntax) produce identical results — `4, 16, 36` — confirmed by
`SequenceEqual` returning `true`, since query syntax is just alternate
surface syntax for the exact same `Where`/`Select` method chain
underneath.
