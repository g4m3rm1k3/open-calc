# Lesson 04: Value vs. Reference Semantics — `struct`, `record`, `class`

**What you will build:** two throwaway proofs — one showing a real,
observable difference in copy behavior between a `struct` and a `class`,
and one showing `record`'s auto-generated value-based equality — settling
by direct evidence, not assertion, why C# has three type-declaring
keywords where Java effectively has one.

**What you need to know first:** [Lesson 02](lesson-02-properties.md)
(properties, used inside both types this lesson builds).

**Terms introduced in this lesson:**
- **Reference type** — a type whose variables hold a reference (an
  address) to an object living elsewhere in memory; assignment copies
  the reference, not the object. Every `class` in C# and every class in
  Java is this kind.
- **Value type** — a type whose variables hold the actual data directly;
  assignment copies the data itself, producing a fully independent copy.
  `struct` declares this kind; Java has no equivalent for user-defined
  types (only its built-in primitives like `int` behave this way).
- **`record`** — a reference type (like `class`) with compiler-generated
  value-based equality and a readable `ToString()`, aimed at
  immutable, data-carrying types.

**Objects and methods used:** none beyond `System.Console.WriteLine`,
already covered.

---

## Concept Unit: `class` — the Behavior Already Known From Java

### The Problem

Before proving `struct` is different, the *known* behavior needs to be
proven too, concretely, so the contrast in the next unit has real
evidence on both sides rather than "trust me, `class` works the way
Java's does."

### Introduce the Concept in Isolation

```csharp
public class PointClass
{
    public double X;
    public double Y;
}

public class Program
{
    public static void Main()
    {
        var a = new PointClass { X = 1, Y = 2 };
        var b = a;
        b.X = 99;

        System.Console.WriteLine($"a.X = {a.X}");
        System.Console.WriteLine($"b.X = {b.X}");
    }
}
```

Output:
```
a.X = 99
b.X = 99
```

`var b = a;` copies only the *reference* to the one real `PointClass`
object — `a` and `b` now both point at the exact same object in memory.
Changing `b.X` through `b` is visible through `a` too, because there was
never a second object; `a` and `b` were always two names for the same
one. This is called **reference semantics**, and it's the behavior every
object type in Java already has — no new concept yet, just proven
directly rather than assumed.

### Discard

`PointClass` is deleted now; a near-identical type, differing only in
one keyword, replaces it next.

### Mechanical Walkthrough

- `public class PointClass { public double X; public double Y; }` —
  **(c) already basic**, ordinary class with two public fields, same
  shape as Java.
- `var a = new PointClass { X = 1, Y = 2 };` — **(a) first appearance**
  of **object initializer syntax**: `{ X = 1, Y = 2 }` immediately after
  `new PointClass()` sets both fields in the same expression, equivalent
  to constructing the object and then writing `a.X = 1; a.Y = 2;` on
  separate lines — a real, common C# convenience with no direct Java
  equivalent (Java would need an explicit constructor taking both
  values, or separate setter calls after construction).
- `var b = a;` — **(c) already basic** as an assignment; what it actually
  *does* (copy the reference) is the entire point of this unit, explained
  above.
- `b.X = 99;` — **(c) already basic**, ordinary field assignment through
  `b`.

## Concept Unit: `struct` — Real, Independent Copies

### The Problem

Java has no user-definable type that copies by value the way its
primitive `int` does — every custom type is reference-copied, full stop.
C# has a real keyword for exactly this: does changing one keyword,
`class` to `struct`, on the identical field layout actually change the
copy behavior just proven above?

### Introduce the Concept in Isolation

```csharp
public struct PointStruct
{
    public double X;
    public double Y;
}

public class Program
{
    public static void Main()
    {
        var a = new PointStruct { X = 1, Y = 2 };
        var b = a;
        b.X = 99;

        System.Console.WriteLine($"a.X = {a.X}");
        System.Console.WriteLine($"b.X = {b.X}");
    }
}
```

Output:
```
a.X = 1
b.X = 99
```

Identical code shape to the `class` version above — only `class` changed
to `struct` — and the output is genuinely different: `a.X` stayed `1`.
`var b = a;` on a `struct` copies the *actual field data*, producing a
second, fully independent `PointStruct` — changing `b.X` afterward has
no effect on `a` at all, because they were never the same object to
begin with, unlike the `class` version where they were. This is called
**value semantics**, and `struct` is C#'s real, provable keyword for it.

### Discard

`PointStruct` is deleted; WPF's own real structs (`Point`, `Size`,
`SortDescription`) are the ones this concept will actually meet later in
this series' WPF arc — this throwaway version exists only to isolate the
copy-behavior proof.

### Mechanical Walkthrough

- `public struct PointStruct { ... }` — **(a) first appearance.** Same
  field layout as `PointClass`; `struct` in place of `class` is the one
  syntactic difference, and it's what changes every variable of this
  type from "holds a reference to an object elsewhere" to "holds the
  actual data directly."
- `var b = a;` — **(b) hard concept reappearing**, the identical
  assignment syntax from the previous unit — proven here to do something
  fundamentally different (a real data copy, not a reference copy)
  purely because of the `struct` keyword on the type it's copying.
- `b.X = 99;` — **(c) already basic** syntactically; its *effect* —
  touching only `b`'s own independent data — is the direct proof this
  unit exists to deliver.

### CS Lens

**(b) hard concept, real restatement.** This is the general **value
semantics vs. reference semantics** distinction most languages make
somewhere, even if not through a user-facing keyword: a value type's
identity *is* its data (two `struct`s with identical field values are
interchangeable), while a reference type has an identity independent of
its data (two `class` objects with identical field values are still two
distinct objects, occupying two distinct places in memory).

Also recognized in: Java's own `int`/`double`/etc. primitives (value
semantics) vs. every Java object type (reference semantics) — the exact
split Java already has, just without a way to *declare your own* value
type the way `struct` allows; Swift's `struct` (directly inspired by
this same C# feature); and Python's distinction between immutable types
like `int`/`tuple` (which behave value-like because they can't be
mutated in place at all) and mutable objects like `list`/custom classes.

### SE Lens

The real tradeoff: a `struct`'s independent-copy guarantee removes a
whole bug class for free — no method can accidentally mutate a caller's
data through a shared reference it wasn't supposed to have, because there
*is* no shared reference. The real cost: copying a large `struct`
(many fields) copies all of that data every single time it's assigned or
passed to a method, which is genuinely more expensive than copying a
reference (a fixed-size address, regardless of the object's real size) —
exactly why `struct` is the right choice for small, simple values (a
point, a size, a color) and the wrong choice for anything large or
frequently reassigned, where `class`'s cheap reference-copy is the better
fit.

## Concept Unit: `record` — Reference Semantics, Value-Based Equality

### The Problem

`class`'s default `==` compares *identity* (are these the same object in
memory?), not *contents* — two separately constructed objects with
identical field values are still considered unequal by default. For data
that's naturally compared by its contents (two snapshots of the same
item, say), writing that comparison logic by hand every time is real,
repetitive boilerplate. Does C# have a way to get that comparison
generated automatically, without giving up reference semantics
entirely?

### Introduce the Concept in Isolation

```csharp
public class PointClassAgain
{
    public double X;
    public double Y;
}

public record PointRecord(double X, double Y);

public class Program
{
    public static void Main()
    {
        var c1 = new PointClassAgain { X = 1, Y = 2 };
        var c2 = new PointClassAgain { X = 1, Y = 2 };
        System.Console.WriteLine($"class ==: {c1 == c2}");

        var r1 = new PointRecord(1, 2);
        var r2 = new PointRecord(1, 2);
        System.Console.WriteLine($"record ==: {r1 == r2}");
    }
}
```

Output:
```
class ==: False
record ==: True
```

`c1`/`c2` — two separately constructed `PointClassAgain` objects with
identical field values — compare as `False`, because plain `class`'s
default `==` checks whether both sides refer to the *same* object in
memory, and they don't. `r1`/`r2` compare as `True` with **zero**
comparison logic written by hand — the compiler, seeing `record`,
automatically generated real `==`/`Equals` logic comparing every declared
value (`X`, `Y`) instead of comparing identity. This is called
**value-based equality**, and `record` is C#'s real keyword for getting
it generated for you.

### Discard

`PointClassAgain`/`PointRecord` are deleted; this proof exists only to
isolate the equality-generation behavior.

### Mechanical Walkthrough

- `public record PointRecord(double X, double Y);` — **(a) first
  appearance**, two things at once: `record` itself (explained above),
  and the parenthesized `(double X, double Y)` right after the type
  name — a **positional record declaration**, a compact syntax that
  simultaneously declares two real properties (`X`, `Y`, exactly the
  property mechanism from Lesson 02) *and* a constructor taking both as
  parameters, all in this single line — no separate `{ get; set; }`
  block or constructor body needed.
- `new PointRecord(1, 2)` — **(a) first appearance** of calling that
  generated constructor directly with positional arguments, rather than
  the object-initializer syntax (`{ X = 1, Y = 2 }`) `class`/`struct`
  used earlier in this lesson — both are real, valid ways to construct an
  object; `record`'s positional syntax is simply the more natural fit
  given it already declares a matching constructor.
- `c1 == c2` / `r1 == r2` — **(c) already basic** as an operator
  (`==`, already known); what it actually *compares* for each type is
  this unit's entire point, explained above.

### SE Lens

The real alternative — hand-writing `Equals`/`GetHashCode` overrides on
an ordinary `class` every time value-based comparison is needed — is
real, correct, and genuinely tedious boilerplate that's easy to get
subtly wrong (forgetting to override `GetHashCode` alongside `Equals`,
for instance, breaks that type's use as a dictionary key in ways that
are easy to miss until it causes a real bug). `record` trades a small
amount of flexibility (its generated equality compares *every* declared
property automatically; a `class` can pick exactly which fields matter
for equality, if that level of control is ever genuinely needed) for
removing that entire category of hand-written, error-prone boilerplate
by default.

## Connect the pieces

One trace: `class` copies by reference (proven: mutating through one
variable is visible through another sharing the same object) and
compares by identity by default. `struct`, identical field layout,
copies by value instead (proven: mutating one copy leaves the other
untouched) — the real, provable reason to reach for it is independence
after a copy, not merely a style preference. `record` keeps `class`'s
reference-copy behavior but adds compiler-generated value-based equality
on top, aimed specifically at data that's naturally compared by its
contents rather than its identity.

## What breaks without this

Take the `struct` proof from earlier and add a constructor-less
assumption: pass `a` (a `PointStruct`) into a method expecting to mutate
the caller's original data by reference, the way passing a `class`
object into a method already does implicitly:

```csharp
static void Nudge(PointStruct p) => p.X += 100;
```

```csharp
var a = new PointStruct { X = 1, Y = 2 };
Nudge(a);
System.Console.WriteLine(a.X);
```

Output:
```
1
```

`a.X` is still `1` — `Nudge` received an independent *copy* of `a` (the
same value-semantics behavior proven earlier, now shown across a method
call boundary, not just a plain assignment), mutated that copy, and the
original `a` was never touched. A reader expecting `class`-style
reference behavior by default would find this surprising; it's the
direct, provable consequence of `struct`'s value semantics applying
uniformly, everywhere a `struct` is copied — assignment, method
parameters, and return values alike.

## Exercises

1. Change `Nudge` to take `ref PointStruct p` instead of plain
   `PointStruct p`, and call it as `Nudge(ref a);`. Confirm `a.X` really
   does change this time — `ref` is C#'s real, explicit mechanism for
   passing a value type by reference when that's genuinely wanted,
   opting back into shared mutation on a case-by-case basis rather than
   changing `struct`'s own default behavior.
2. Add a third field, `Label` (a `string`), to a copy of `PointRecord`,
   construct two instances with the same `X`/`Y` but different `Label`
   values, and compare them with `==`. Confirm the result and explain,
   from what this lesson proved about `record`'s generated equality,
   exactly why that result is correct.

## Definition of Done

- [ ] You compiled and ran both the `class` and `struct` copy proofs and
      saw the genuinely different output.
- [ ] You compiled and ran the `record` equality proof and saw `True`
      where the plain `class` version showed `False`.
- [ ] You can state, in your own words, when you'd reach for `struct`
      over `class`, and the real cost that choice trades away.
- [ ] You completed both exercises and observed the described behavior
      yourself.

## Next

[Lesson 05 — Lambda Expressions](lesson-05-lambda-expressions.md) starts
this series' final C# arc: passing behavior itself — not data — as a
value, the mechanism nearly every later WPF lesson (event handlers,
`{Binding}`, `ICommand`) depends on.
