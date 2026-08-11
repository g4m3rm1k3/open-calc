# Concept: Value Tuples (`(string Name, int Age)`, Tuple Literals)

**What you'll understand by the end:** what `(Type Name, Type Name, ...)`
means as a type, how a tuple literal like `("Ada", 36)` builds one, how
element names let you read `.Name` instead of `.Item1`, and why this is
a genuinely different thing from declaring a small class just to hold a
few related values together.

**Prerequisites:** none beyond ordinary variable declarations and a
`foreach` loop.

## Setup

```
dotnet new console -o lab-tuples
cd lab-tuples
```

Replace the generated `Program.cs`'s contents with the example below.

## The Problem

Sometimes a method, or a piece of local code, needs to group two or
three *related* values together — a name and an age, a name and a
category and a flag — without those values being important enough, or
reused enough elsewhere, to justify writing a whole named `class` just
to carry them around. Returning them as separate, independent
variables loses the fact that they belong together; wrapping them in a
full class is real ceremony (a file, a constructor, property
declarations) for something that might only ever be used in one method.

## The Isolated Example

**First, a tuple with no element names at all:**

```csharp
(string, int) unnamed = ("Ada", 36);
Console.WriteLine($"Unnamed: {unnamed.Item1} is {unnamed.Item2}");
```

**Real output — `dotnet run`:**
```
Unnamed: Ada is 36
```

**What this proves:** `(string, int)` is a real, legal type — a
**value tuple** — built from a **tuple literal**, `("Ada", 36)`, on
the right. With no names supplied, C# falls back to compiler-generated
member names, `Item1` and `Item2`, numbered by position — usable, but
meaningless to read at the call site months later.

**Now with element names — the actually useful form:**

```csharp
(string Name, int Age) person = ("Ada", 36);
Console.WriteLine($"Named: {person.Name} is {person.Age}");
```

**Real output — `dotnet run`:**
```
Named: Ada is 36
```

**What this proves:** writing `(string Name, int Age)` instead of
`(string, int)` is called a **named tuple** — same underlying value,
same two elements, but the *declared type itself* carries a name for
each position. `person.Name` and `person.Age` read exactly like
property access on a class, even though no class was ever written.

**Now the shape the real project code actually uses — a `List<T>` of
named tuples, read back out through a `foreach`:**

```csharp
List<(string Name, string Category, bool IsFavorite)> items = new()
{
    ("Hex Bolts", "Tools", true),
    ("USB Cable", "Electronics", false),
};

foreach (var item in items)
{
    Console.WriteLine($"{item.Name} [{item.Category}] favorite={item.IsFavorite}");
}
```

**Real output — `dotnet run`:**
```
Hex Bolts [Tools] favorite=True
USB Cable [Electronics] favorite=False
```

**What this proves:** a named tuple type works as a type argument to
any generic container exactly like any other type — `List<(string
Name, string Category, bool IsFavorite)>` is a list whose elements are
three-element tuples, and each `("Hex Bolts", "Tools", true)` entry in
the initializer is a tuple literal matching that declared shape by
position. Inside the `foreach`, `item` is inferred as that same tuple
type, so `item.Name`, `item.Category`, and `item.IsFavorite` are
available immediately — no separate class, no separate constructor
call, for data that exists only to be grouped and read back.

## Mechanical Walkthrough

- `(string, int)` — a **tuple type** written directly where any other
  type name would go (a variable declaration, a generic type argument,
  a return type). Underneath, this compiles to the real .NET struct
  type `System.ValueTuple<string, int>` — a genuine value type, not a
  reference type wrapping two boxed fields.
- `("Ada", 36)` — a **tuple literal**: a comma-separated list of values
  in parentheses, with no `new` keyword and no type named explicitly.
  The compiler infers the tuple's element types from the values
  themselves, or matches them positionally against whatever tuple type
  the literal is being assigned into.
- `.Item1` / `.Item2` — the default, compiler-generated member names
  for an unnamed tuple's elements, numbered from `1`, not `0`.
- `(string Name, int Age)` — the same tuple type, with each position
  given a real name (`Name`, `Age`) as part of the type's own
  declaration. These names exist only at compile time — they're not
  stored anywhere at runtime, and only appear (via a compiler-emitted
  attribute) so that IDEs and reflection-based tools can still recover
  them for tooling purposes.
- `person.Name`, `person.Age` — member access using the declared
  element names instead of `Item1`/`Item2`. Both forms of access
  compile to reading the exact same underlying field; the named form
  is purely a readability improvement for the person writing and
  reading the code.
- `List<(string Name, string Category, bool IsFavorite)>` — a named
  tuple type used as a generic type argument, exactly like `List<int>`
  or `List<string>` would be. Nothing about `List<T>` needed to change
  or know anything special to hold tuples — a tuple is just another
  type.
- `foreach (var item in items)` — an ordinary `foreach`, reappearing
  syntax; `var` here infers `item`'s type as the full named tuple type,
  so its element names remain available inside the loop body without
  writing the tuple type out a second time.

## CS Lens

A tuple is a **lightweight, unnamed product type** — a way of
combining several values of (possibly different) types into one
compound value, without declaring a new named type for the
combination. This is the same underlying idea C and C++'s `struct`
began as, Python's built-in `tuple`, and functional languages'
tuple/product types generally — group related values, access them
together, without ceremony.

Also recognized in: Python's `(name, age) = ("Ada", 36)` and its
tuple-unpacking assignment; TypeScript's tuple types (`[string,
number]`); Go's multiple return values (`func f() (string, int)`),
which are conceptually a returned tuple even though Go doesn't call
them that; SQL's own conceptual "row" as a fixed-shape tuple of
column values.

## SE Lens

The real, deliberate tradeoff a named tuple makes against a full
class: a tuple costs nothing to declare — no new file, no
constructor, no explicit property syntax — which makes it a good fit
for values that are genuinely local and short-lived, used by one or
two nearby pieces of code and never passed far from where they're
built. The cost shows up as that data becomes more important: a tuple
has no room for real behavior (methods, validation, computed
properties), its element names aren't enforced anywhere outside the
exact declared type (two tuples with the same shape but different
element names are still assignment-compatible, silently), and a
tuple's meaning is only as clear as its element names — an unnamed
tuple passed several calls deep is a real readability trap. The
practical rule most codebases converge on: reach for a tuple when the
grouping is local and temporary; reach for a real class once the same
shape needs to be passed widely, carries any real behavior, or starts
showing up as a parameter or return type in more than one or two
places.

## Connection

Tuples are frequently paired with `foreach` and `List<T>`/`IEnumerable<T>`
to move several related, ad hoc values through a loop without a
dedicated type — the exact shape shown in this file's third example.
They're also commonly used as a lightweight multi-value method return
(`(bool Success, string Error) TryParse(...)`), letting a method hand
back more than one related result without an `out` parameter or a
purpose-built result class.

## Try It Yourself

1. Declare a tuple with three unnamed elements, `(string, string,
   bool)`, and confirm the compiler-generated member names are
   `Item1`, `Item2`, `Item3` — in that exact order, matching the
   literal's own position, not alphabetical or declaration order of
   any other kind.
2. Write a method `(int Min, int Max) GetRange(List<int> values)` that
   returns a named tuple built from `values.Min()` and `values.Max()`,
   and call it, reading the result's `.Min`/`.Max` members directly at
   the call site with no intermediate variable.
3. Declare two tuple-typed variables with the *same* element types but
   *different* element names — `(string Name, int Age) a = ("Ada",
   36);` and `(string Label, int Count) b = ("Ada", 36);` — and try
   assigning `a = b;`. Confirm it compiles with no error, and reason
   about why: tuple element names are a compile-time readability aid
   only, not part of the runtime type identity the assignment checks.
