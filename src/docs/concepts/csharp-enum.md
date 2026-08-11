# Concept: `enum` — A Closed Set of Named Values

**What you'll understand by the end:** what `enum` actually declares (a brand-new type whose only legal values are a fixed, named set), why every member secretly is an integer underneath, and why a `string` or raw `int` can't offer the same compiler-enforced guarantee for data that only ever makes sense as one of a small, known set of choices.

**Prerequisites:** `csharp-classes-objects-and-fields.md`.

## Setup

```
dotnet new console -o lab-enum
cd lab-enum
```
Replace the generated `Program.cs`'s contents with the example below.

## The Problem

Some data genuinely only makes sense as one of a small, known, closed set of values — a compass direction, a status, a category. A plain `string` would technically hold any of those, but also holds every typo, every inconsistent capitalization, and every value that was never a real option at all, with nothing in the type system stopping it.

## The Isolated Example

In `Program.cs`:
```csharp
Direction current = Direction.East;
Console.WriteLine(current);
Console.WriteLine((int)current);
Console.WriteLine(current == Direction.East);

Console.WriteLine("---");

foreach (Direction d in Enum.GetValues(typeof(Direction)))
{
    Console.WriteLine(d);
}

enum Direction
{
    North,
    East,
    South,
    West
}
```

(The `enum` declaration has to come *after* the executable statements in a top-level-statements `Program.cs` — executable code first, type declarations after.)

**Real output — `dotnet run`:**
```
East
1
True
---
North
East
South
West
```

#### Execution Trace

`Enum.GetValues` returns every member in declared order — the `foreach` walks that list, one member at a time:

1. `d = North` — the first element `Enum.GetValues` returns, because `North` is declared first in the enum definition and this method walks members in declared order — prints `North`.
2. `d = East` — the `foreach` advances to the next member in declared order, since `East` was declared immediately after `North` — prints `East`.
3. `d = South` — advances to the third declared member, because `South` was declared immediately after `East` — prints `South`.
4. `d = West` — reaches the last declared member, and the loop ends afterward because `Enum.GetValues` returned exactly four elements — prints `West`.

**What this proves:** `enum Direction { North, East, South, West }` declares a brand-new **type**, `Direction`, whose only legal values are exactly those four named members — nothing else is a `Direction`, ever, and the compiler enforces this at every point a `Direction` is used. `Direction.East` refers to one specific member, qualified by its enum's name. `Console.WriteLine(current)` printed `East` — the literal member name, not a number — even though `(int)current` proves every member secretly *is* an integer underneath (`North`=0, `East`=1, `South`=2, `West`=3, assigned in declared order, starting at 0, unless overridden). `current == Direction.East` compares two enum values the same way any value is compared, returning `True`. `Enum.GetValues(typeof(Direction))` returns every member of a given enum type, in declared order, as a collection you can loop over with `foreach`.

## Mechanical Walkthrough

- `enum Direction { North, East, South, West }` — declares a brand-new type whose only legal values are exactly those four named members — enforced by the compiler everywhere `Direction` is used.
- `Direction.East` — one specific member, qualified by its enum's name — the same `Type.Member` shape as accessing any other `static` member.
- `(int)current` — casting an enum to `int`: every member secretly *is* an integer underneath, assigned in declared order starting at `0`.
- `current == Direction.East` — an ordinary equality comparison, now comparing two enum values.
- `Enum.GetValues(typeof(Direction))` — a `static` method returning every member of a given enum type, in declared order, as a collection `foreach` can walk.

## CS Lens

An `enum` is a concrete instance of a **finite, named set** — the type system expressing "exactly these values, nothing else" instead of relying on a comment or a naming convention to say so.

Also recognized in: Python's `enum.Enum` class (the direct equivalent, though Python's version is opt-in — nothing stops a Python programmer from using a bare string instead, where C#'s `enum` is a real, separate type the compiler checks); TypeScript's `enum` keyword; Java's `enum` (which goes further still, allowing each member its own fields and methods); database `CHECK` constraints restricting a column to a fixed list of values; a UI dropdown offering a fixed, closed set of choices, expressing the same idea as markup instead of code.

## SE Lens

Why not just validate a `string` against an allowed list at the point it's saved? Because that validation would have to be repeated, correctly, at every single place the value is written — and any one call site forgetting the check reintroduces exactly the inconsistent-spelling problem an `enum` exists to prevent. An `enum` moves the guarantee into the type itself: there is no code path anywhere capable of producing a value that isn't one of the declared members — not because every call site remembered to check, but because an invalid one literally cannot compile. The cost is real too: adding a new legal value later means changing the enum's own declaration and recompiling every piece of code that depends on it, rather than just writing a new string somewhere — a closed set is closed on purpose, and that has to be a genuine, deliberate design choice about the data, not a default reached for without thinking about whether the set might need to grow.

## Connection

Any property or field representing a fixed, closed category — a status that only ever transitions between a handful of known states, a classification with a small, agreed-upon list of options — is a natural `enum` candidate, using exactly this mechanism.

## Try It Yourself

1. Add a fifth member, `Northeast`, to `Direction`. Rerun the `foreach` loop and confirm it appears, in declared position, with no other code change.
2. Change `current` to `Direction.North` and predict `(int)current`'s value before rerunning — confirm declared order really does start counting at `0`.
3. Try `Direction current = 1;` (a raw `int`, not a `Direction` member) and read the real compiler error — confirm a `Direction` genuinely cannot be built from a bare number without an explicit cast, even though every member secretly is an `int` underneath.
