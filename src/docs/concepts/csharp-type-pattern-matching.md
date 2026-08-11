# Concept: Type Pattern Matching (`is Type name`)

**What you'll understand by the end:** what `is Type variableName`
actually does — testing an object's runtime type *and* binding it to a
new, correctly-typed variable in one expression — and why that's a
genuinely different tool from a plain `(Type)` cast, not just shorter
syntax for the same thing.

**Prerequisites:** none beyond an ordinary `if` statement and knowing
what `object` means as a type.

## Setup

```
dotnet new console -o lab-pattern-matching
cd lab-pattern-matching
```

Replace the generated `Program.cs`'s contents with the example below.

## The Problem

Code that holds a value as `object` (or as some general base type) but
needs to work with it as a more specific type has to check "is this
actually the type I think it is?" before touching any member specific
to that type — reading a `.Length` off something that turns out not to
be a `string` is a runtime error waiting to happen. The obvious tools
— a plain cast, or `is` used only as a yes/no check — each solve half
of this problem and leave the other half as extra, easy-to-forget
work: a cast fails hard when it's wrong, and a bare `is` check tells
you the type matches but hands you nothing typed to actually use.

## The Isolated Example

**A type pattern that matches — testing and binding in one step:**

```csharp
object obj = "hello";

if (obj is string s)
{
    Console.WriteLine($"Matched: length {s.Length}");
}
```

**Real output — `dotnet run`:**
```
Matched: length 5
```

**What this proves:** `obj is string s` did two things in one
expression — it checked whether `obj`'s actual runtime type is
(or derives from) `string`, *and*, because it matched, it created a
new local variable `s`, already typed as `string`, holding that same
value. `s.Length` is legal immediately, with no separate cast anywhere
in the code.

**The same pattern against a value that doesn't match:**

```csharp
object number = 42;

if (number is string s2)
{
    Console.WriteLine($"won't print: {s2}");
}
else
{
    Console.WriteLine("Not a string -- no exception, just false");
}
```

**Real output — `dotnet run`:**
```
Not a string -- no exception, just false
```

**What this proves:** when the pattern doesn't match, `obj is string
s2` simply evaluates to `false` — the `if` block is skipped, no
exception is thrown, and `s2` is never assigned (the compiler doesn't
even let you read `s2` inside the `else` block, since it's only
definitely assigned on the `true` branch).

**Now the contrast — a plain cast against that exact same mismatched
value:**

```csharp
try
{
    string forced = (string)number;
    Console.WriteLine(forced);
}
catch (InvalidCastException ex)
{
    Console.WriteLine($"Cast threw: {ex.Message}");
}
```

**Real output — `dotnet run`:**
```
Cast threw: Unable to cast object of type 'System.Int32' to type 'System.String'.
```

**What this proves:** `(string)number`, given a value that genuinely
isn't a `string`, doesn't return `false` or `null` — it throws a real
`InvalidCastException` immediately. A plain cast is an *assertion*
("trust me, this is a `string`") that crashes when it's wrong; a type
pattern is a *question* ("is this a `string`?") that safely answers
`false` when it's wrong, with nothing to catch.

## Mechanical Walkthrough

- `obj is string s` — the **type pattern** itself: an expression, not
  a statement, that evaluates to `bool`. It checks whether `obj`'s
  actual runtime type is `string` (or a type derived from `string`,
  though `string` itself is sealed so that distinction doesn't apply
  here) and, only if the check succeeds, declares and assigns a new
  variable — `s`, of type `string` — in the same expression.
- `s.Length` — reading a `string`-specific member directly on the
  pattern-bound variable, with no cast anywhere in this line, because
  `s`'s declared type is already `string`, not `object`.
- `number is string s2` (mismatch case) — the identical pattern,
  evaluating to `false` this time; `s2` is declared but the compiler
  tracks it as *not definitely assigned* outside the `true` branch —
  attempting to read `s2` inside the `else` block is a compile error,
  not a runtime `null`.
- `(string)number` — a plain **cast expression**, reappearing basic
  syntax (an unchecked type assertion): tells the compiler to trust
  that `number` really is a `string`, with no test involved at all.
- `catch (InvalidCastException ex)` — the specific exception type the
  runtime throws when a cast between incompatible reference types
  fails; distinct from `NullReferenceException` (a value that's
  missing) or `FormatException` (a value that's the wrong shape,
  as text) — this one specifically means "the object exists, but its
  actual runtime type isn't the one the cast demanded."

## CS Lens

This is **type pattern matching**, one case of C#'s broader pattern
matching feature (which also includes patterns over constants, tuples,
and an object's individual property values, not covered here). Its
core idea — testing a value's shape or type and extracting a
correctly-typed handle to it in a single step, only reachable when the
test succeeds — is a small piece of the same idea full pattern matching
in other languages does at a much larger scale.

Also recognized in: Java's `instanceof` pattern variable
(`if (obj instanceof String s)`, added in Java 16 with the identical
test-and-bind shape); TypeScript's type narrowing after a
`typeof`/`instanceof` check, where the compiler statically re-types a
variable inside the matching branch with no explicit cast written;
Rust's and Swift's `match`/`switch` pattern matching, which generalizes
this same "test the shape, bind the parts that matched" idea across an
entire value, not just a single type check; Python's structural pattern
matching (`match`/`case`, 3.10+), which does the same for arbitrary
object shapes, not only types.

## SE Lens

Why does C# offer both a type pattern and a plain cast, rather than
just one? Because they answer genuinely different questions, and using
the wrong one for a given situation produces the wrong failure mode.
A plain cast is the right tool when being wrong is a real bug that
should stop the program immediately and loudly — code that has already
established, by construction, that a value can only be one specific
type, and a mismatch would mean something is seriously broken
elsewhere. A type pattern is the right tool when a mismatch is a
legitimate, expected possibility that the code needs to handle as a
normal branch, not an exceptional one — iterating a collection of
mixed types and only acting on the ones that happen to be a particular
kind, for instance. Reaching for a plain cast in that second situation
means wrapping it in a `try`/`catch` just to treat "wrong type" as
ordinary control flow — using exceptions for something that isn't
actually exceptional, which is both slower (exceptions carry real
runtime cost) and reads as if a mismatch were a bug rather than an
expected case.

## Connection

Type pattern matching is commonly reached for while iterating a
collection whose declared element type is more general than what any
one element actually is at runtime (a collection of `object`, or a
common base type with several different derived types mixed together)
— checking each element's real type and only acting on the ones that
match, without a separate cast-then-check-for-null step. It composes
with `foreach` naturally: `if (entry is SomeType typed) { ... }` inside
a loop body is the standard shape for "handle only the elements that
are actually this kind."

## Try It Yourself

1. Add a second `if (obj is int i)` check on the same `obj` variable
   used in this file's first example (still holding `"hello"`).
   Confirm it evaluates to `false` and explain, in your own words, why
   an `object` holding a `string` doesn't also match `int` — there's no
   implicit conversion between unrelated reference and value types
   being attempted here.
2. Rewrite the mismatch example's `if`/`else` as a single expression
   using the `is not` pattern (`if (number is not string s2)`), and
   confirm the logic still behaves identically with the branches
   swapped — `is not` negates a type pattern the same way `!` negates
   an ordinary `bool` expression.
3. Build a `List<object>` containing a mix of `int`, `string`, and
   `bool` values, loop over it with `foreach`, and use a type pattern
   inside the loop to print only the `string` elements, each with its
   `.Length` — confirming the pattern both filters (skips non-matching
   elements) and gives you a correctly-typed variable for the ones that
   do match, in one step.
