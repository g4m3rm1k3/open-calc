---
concept: 210-records
name: Records (C#)
---

## Definition

A record is a reference type (or, with `record struct`, a value type)
specifically designed for immutable data modeling — automatically
generating value-based equality (`==` compares CONTENTS, not identity), a
readable `ToString()`, and a concise `with` expression for creating a
modified COPY, all without hand-writing that boilerplate.

## Problem

Modeling a simple, immutable data holder with a regular `class` requires
manually writing (or generating via an IDE) equality overrides
(`Equals`, `GetHashCode`), a meaningful `ToString()`, and any "create a
modified copy" logic — repetitive boilerplate for what's conceptually
just "a bundle of values." Records generate all of this automatically
from a concise declaration.

## Execution

A ONE-LINE record declaration defines immutable properties directly in
its signature
↓
Two SEPARATE instances are created with the SAME values
↓
Comparing them with `==` is `true` — records use VALUE-based equality
automatically, comparing every property, unlike a plain class where `==`
would compare object identity (`false` for two separate instances)
↓
Printing a record shows a readable, auto-generated representation of its
values, instead of the default unhelpful representation
↓
A `with` expression creates a NEW record with one property changed and
the rest copied unchanged — the original record itself remains
completely unmodified, since records are immutable by default

## Computer Science

Records are specifically designed around VALUE-based equality and
immutability, contrasting with ordinary classes' default REFERENCE-based
equality (`==` comparing identity) and mutability — this makes records a
natural fit for modeling data that should be compared by content (like a
coordinate, a money amount, a DTO) rather than by which specific object
instance it is.

Tags: Value-based equality, Immutability by default, with-expressions

## Software Engineering

Records are the idiomatic modern C# choice for DTOs (data transfer
objects), API request/response models, and any other "just a bundle of
immutable values" type — replacing what used to require substantial
boilerplate (or external libraries) with a single, concise declaration.

Tags: DTOs, API models, Idiomatic modern C#

## Common Mistakes

- Using a plain `class` for simple immutable data and manually re-implementing equality/ToString/copy logic — a `record` provides all of this automatically from a much more concise declaration.
- Assuming `with` MUTATES the original record — it doesn't; it always creates and returns a NEW record instance with the specified changes, leaving the original completely untouched.

## Exercises

- Trace through what an equality comparison would return for two records with DIFFERENT property values, versus the same values — confirm this is genuinely comparing CONTENT, not identity.
- Explain why using `with` to change one property doesn't change the original record — what does the resulting new record actually contain for its other, unchanged properties?

## csharp

```csharp
using System;

var p1 = new Point(1, 2);
var p2 = new Point(1, 2);
var p3 = new Point(9, 9);

Console.WriteLine(p1 == p2);   // True -- value-based equality: same X and Y, different instances
Console.WriteLine(p1 == p3);   // False -- different values

Console.WriteLine(p1);         // Point { X = 1, Y = 2 } -- auto-generated readable ToString()

var p4 = p1 with { X = 99 };   // creates a NEW record, X changed, Y copied unchanged
Console.WriteLine(p4);         // Point { X = 99, Y = 2 }
Console.WriteLine(p1);         // Point { X = 1, Y = 2 } -- p1 itself is COMPLETELY unchanged

public record Point(int X, int Y);
```
Walkthrough: `p1 == p2` is `true` despite being two separate instances,
since records compare by VALUE (`X` and `Y`), not identity — a plain
`class` would print `false` here instead. `p1 with { X = 99 }` produces
`p4`, a brand new record with `X` changed and `Y` copied unchanged from
`p1`; printing `p1` afterward confirms it was never mutated at all,
demonstrating records' immutable-by-default design.
