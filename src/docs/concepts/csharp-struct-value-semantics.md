# Concept: `struct` vs. `class` — Value Semantics vs. Reference Semantics

**What you'll understand by the end:** the one real, mechanical difference between a `struct` and a `class` — what actually happens when a value of each is assigned to a second variable — proven with real, directly contrasting output, not just described.

**Prerequisites:** `csharp-classes-objects-and-fields.md`.

## Setup

```
dotnet new console -o lab-struct
cd lab-struct
```
Replace the generated `Program.cs`'s contents with the example below.

## The Problem

Assigning an object built from a `class` to a second variable, then mutating a field through that second variable, changes what the first variable sees too — both variables end up pointing at the same real object. Worth checking directly whether that's a universal rule of the language, or something specific to `class`.

## The Isolated Example

In `Program.cs`:
```csharp
CoordinateStruct originalStruct = new CoordinateStruct { X = 5, Y = 5 };
CoordinateStruct copiedStruct = originalStruct;
copiedStruct.X = 100;

Console.WriteLine($"struct original.X: {originalStruct.X}");
Console.WriteLine($"struct copied.X: {copiedStruct.X}");

CoordinateClass originalClass = new CoordinateClass { X = 5, Y = 5 };
CoordinateClass copiedClass = originalClass;
copiedClass.X = 100;

Console.WriteLine($"class original.X: {originalClass.X}");
Console.WriteLine($"class copied.X: {copiedClass.X}");

struct CoordinateStruct
{
    public int X;
    public int Y;
}

class CoordinateClass
{
    public int X;
    public int Y;
}
```

**Real output — `dotnet run`:**
```
struct original.X: 5
struct copied.X: 100
class original.X: 100
class copied.X: 100
```

**What this proves:** for `CoordinateStruct`, mutating `copiedStruct.X` left `originalStruct.X` completely untouched — two genuinely independent values. For `CoordinateClass`, the identical-looking code produced a completely different result: mutating `copiedClass.X` changed `originalClass.X` too — there was never a second, independent object, only a second name pointing at the one real one.

#### Execution Trace

1. `CoordinateStruct copiedStruct = originalStruct;` — copies `CoordinateStruct`'s entire contents (`X` and `Y`) into a brand-new, independent value.
2. `copiedStruct.X = 100;` — changes only that independent copy.
3. `originalStruct.X` — still reads `5`, completely unaffected, because step 1 produced a genuinely separate value.
4. `CoordinateClass copiedClass = originalClass;` — copies only a *reference* — both `originalClass` and `copiedClass` now point at the exact same real `CoordinateClass` object in memory.
5. `copiedClass.X = 100;` — changes that one shared object.
6. `originalClass.X` — now also reads `100`, because `originalClass` and `copiedClass` were always two names for the same object, never two separate ones.

## Mechanical Walkthrough

- `struct CoordinateStruct { public int X; public int Y; }` — declared exactly like a `class`, field for field — the keyword itself is the only source difference; the behavioral difference is entirely in how assignment works.
- `CoordinateStruct copiedStruct = originalStruct;` — an ordinary-looking assignment that behaves completely differently depending on whether the type on the left is a `struct` or a `class` — nothing about the syntax itself signals which behavior applies; only the type's own declaration (`struct` vs. `class`) decides.
- `class CoordinateClass { public int X; public int Y; }` — identical field shape to `CoordinateStruct`, included only for direct, side-by-side contrast.

## CS Lens

`struct` is called a **value type** — assignment copies the entire value, producing two genuinely independent things. `class` is called a **reference type** — assignment copies only a reference, producing two names for the one real object. This is the single, real, mechanical difference; everything else commonly said about `struct` vs. `class` follows from it.

Also recognized in: Java's primitives (`int`, `double`, copied by value) versus its objects (copied by reference) — a related but not identical distinction, since Java has no user-definable value types the way C#'s `struct` is; Swift's `struct` (value type) versus `class` (reference type) is the closest direct sibling, using the identical two keywords for the identical distinction; Python has no user-facing value-type keyword at all — every user-defined object is reference semantics, which is part of why this distinction can feel unfamiliar coming from Python specifically.

## SE Lens

Why does a language offer both, instead of just reference semantics for everything? Because independent copies are sometimes exactly the desired behavior — a coordinate, a date, a small bundle of numbers where "changing my copy shouldn't affect yours" is the whole point — and value types deliver that with zero extra code, no manual cloning required. The cost: passing a large `struct` around by value means copying its entire contents every time, which gets expensive as the struct grows, unlike a reference type, where passing it around only ever copies a small reference regardless of how large the underlying object is. The real, practical rule: `struct` for small, simple values where independent copies are wanted; `class` for anything with real, ongoing identity — anything a user selects, edits, tracks, or that needs to be visibly shared across more than one place in a program.

## Connection

Any type representing a small, self-contained value with no real identity of its own — a point, a color, a date, a sort key — is a natural `struct` candidate, and behaves exactly as this file's `CoordinateStruct` proof demonstrated. Any type representing something with ongoing identity that multiple parts of a program need to observe and mutate *the same* instance of stays a `class`, for the identical reason `CoordinateClass`'s shared-mutation behavior here was not a bug — it's what reference semantics are for.

## Try It Yourself

1. Write a method `void TryModify(CoordinateStruct p) { p.X = 999; }`, call it with a real `CoordinateStruct`, and confirm, with real output, that the original is unaffected — value-type copying applies to method parameters exactly the same way it applies to plain assignment.
2. Predict, in your own words, what `int` — a real, built-in C# type — actually is: `struct` or `class`? Write a quick check (assign one `int` to another, mutate the second, check the first) to confirm your prediction with real output before looking it up.
3. Add a third field to `CoordinateStruct`, a nested `CoordinateClass Owner`, and re-run the copy test. Confirm the outer `struct` still copies its own value fields independently, but the `Owner` reference itself is still shared between the original and the copy — a `struct` containing a reference-type field copies the reference, not a deep clone of what it points to.
