# Lesson 05a: A Value That Can Only Be One of a Few Things

*(Prepended before Lesson 6 — see `CURRICULUM_NOTES.md`'s 2026-07-29
revision. Lesson 6 uses an enum-backed `Orientation` property and calls
it "first appearance" without ever explaining what `enum` actually is —
`enum` doesn't get a real, isolated lab anywhere until Lesson 12, six
lessons later. This lesson moves that teaching to where it's actually
first needed.)*

**Developer Story**
> As a developer, I want a way to say "this value can only ever be one
> of a small, known set of choices" — enforced by the compiler, not by
> a comment or a naming convention — before I read a property that
> depends on exactly that guarantee.

**What you will build**
Nothing that survives — a throwaway lab, discarded once proven. What
you walk away with: real understanding of `enum` before Lesson 6's own
`Orientation` property, and before Lesson 12 builds a real one
(`Category`) into the actual Pocket Inventory model.

**What you need to know first**
Lesson 00a (class, object). Basic Python: functions, data types, loops,
`list`, `dict`. Nothing about `enum` in any language — if Python's own
`enum.Enum` is unfamiliar too, this lesson assumes exactly that.

**Terms introduced in this lesson:**
- **`enum`** (e.g. `enum Season { Spring, Summer, Fall, Winter }`) —
  declares a brand-new type whose only legal values are a fixed, named
  set of members (`Season.Fall`, qualified by the enum's name),
  enforced by the compiler everywhere it's used.
- **`Enum.GetValues(typeof(T))`** — a `static` method returning every
  member of a given enum type, in declared order.
- **Casting an enum to `int`** (e.g. `(int)current`) — every enum
  member is secretly an integer underneath, assigned in declared order
  starting at `0`.

**Objects and methods used**
- `Console.WriteLine`, already given full treatment in Lesson 00a,
  reappears in this lesson's own `Season` lab — brief reminder only,
  per the Repetition Rule. `enum` and `Enum.GetValues` are this
  lesson's own subject, given full treatment above.

---

## Concept Unit: `enum` — Declaring a Closed Set of Named Values

### The Problem

Some data genuinely only makes sense as one of a small, known, closed
set of values — a season, a direction, a status. A plain `string` would
technically hold any of those, but also holds every typo, every
inconsistent capitalization, and every value that was never a real
option at all, with nothing in the type system stopping it.

### Introduce the Concept in Isolation

```
dotnet new console -o lab-enum
cd lab-enum
```

Replace `Program.cs`:

```csharp
Season current = Season.Fall;
Console.WriteLine(current);
Console.WriteLine((int)current);
Console.WriteLine(current == Season.Fall);

Console.WriteLine("---");

foreach (Season season in Enum.GetValues(typeof(Season)))
{
    Console.WriteLine(season);
}

enum Season
{
    Spring,
    Summer,
    Fall,
    Winter
}
```

(The `enum` declaration has to come *after* the executable statements
in this file, not before — the top-level-statements rule: executable
code always comes first, type declarations after, in a top-level-
statements `Program.cs`.)

Run it:

```
dotnet run
```

Real output:

```
Fall
2
True
---
Spring
Summer
Fall
Winter
```

#### Execution Trace

`Enum.GetValues` returns every member in declared order — the `foreach`
below `"---"` just walks that list, one member at a time:

1. `season = Spring` — the first element `Enum.GetValues` returns,
   because `Spring` is declared first in the enum definition and this
   method walks members in declared order — prints `Spring`.
2. `season = Summer` — the `foreach` advances to the next member in
   declared order, since `Summer` was declared immediately after
   `Spring` — prints `Summer`.
3. `season = Fall` — advances to the third declared member, because
   `Fall` was declared immediately after `Summer` — prints `Fall`.
4. `season = Winter` — reaches the last declared member, and the loop
   ends afterward because `Enum.GetValues` returned exactly four
   elements — prints `Winter`.

*What this proves:* `enum Season { Spring, Summer, Fall, Winter }`
declares a brand-new **type**, `Season`, whose only legal values are
exactly those four named members — nothing else is a `Season`, ever,
and the compiler enforces this at every point a `Season` is used, the
same static-typing guarantee Lesson 0 already established, now applied
to "one of a fixed list" instead of "a number" or "a string."
`Season.Fall` refers to one specific member, qualified by its enum's
name, the same `Type.Member` shape as `Math.PI` or any `static` member
access (Lesson 01a). `Console.WriteLine(current)` printed `Fall` — the
literal member name — not a number, even though `(int)current` proves
every member secretly *is* an integer underneath (`Spring`=0,
`Summer`=1, `Fall`=2, `Winter`=3, assigned in declared order, starting
at 0, unless overridden). `current == Season.Fall` compares two enum
values the same way any value is compared, returning `True`.
`Enum.GetValues(typeof(Season))` is a `static` method that returns
every member of a given enum type, in declared order, as a collection
you can loop over with `foreach`.

### Discard the Throwaway Example

Delete the `lab-enum` folder. `Season` never appears again.

### Mechanical Walkthrough

- `enum Season { Spring, Summer, Fall, Winter }` — (first appearance)
  declares a brand-new type whose only legal values are exactly those
  four named members — enforced by the compiler everywhere `Season` is
  used.
- `Season.Fall` — (first appearance) one specific member, qualified by
  its enum's name — the same `Type.Member` shape as a `static` member
  access.
- `(int)current` — (first appearance of casting an enum) every member
  secretly *is* an integer underneath, assigned in declared order
  starting at `0`.
- `current == Season.Fall` — (already basic, `==`) now comparing two
  enum values.
- `Enum.GetValues(typeof(Season))` — (first appearance) a `static`
  method returning every member of a given enum type, in declared
  order, as a collection `foreach` can walk.

### CS Lens

An `enum` is a concrete instance of a **finite, named set** — the type
system expressing "exactly these values, nothing else" instead of
relying on a comment or a naming convention to say so.

Also recognized in: Python's `enum.Enum` class (the direct equivalent,
though Python's version is opt-in — nothing stops a Python programmer
from using a bare string instead, where C#'s `enum` is a real, separate
type the compiler checks); TypeScript's `enum` keyword; HTML's
`<select>` options, expressing the same closed-set idea as markup
instead of code; database `CHECK` constraints restricting a column to a
fixed list of values.

### SE Lens

Why not just validate a `string` against an allowed list at the point
it's saved? Because that validation would have to be repeated,
correctly, at every single place the value is written — and any one
call site forgetting the check reintroduces exactly the inconsistent-
spelling problem an `enum` exists to prevent. An `enum` moves the
guarantee into the type itself: there is no code path anywhere capable
of producing a value that isn't one of the declared members — not
because every call site remembered to check, but because an invalid one
literally cannot compile.

### Connection

Lesson 6's `Orientation` property is enum-backed — this exact
mechanism, already real by the time you read it. Lesson 12 builds a
real one, `Category`, into the actual Pocket Inventory model, in this
same shape.

---

## Closing

### Connect the Pieces

One throughline: `enum Season { ... }` declared a brand-new type with
exactly four legal values; every operation this lab ran — printing,
casting to `int`, comparing with `==`, enumerating every member via
`Enum.GetValues` — worked because `Season` is a real, compiler-checked
type, not a convention layered on top of `string` or `int`.

### What Breaks Without This

Trying to build a `Season` from a raw `int` instead of a real member —
`Season current = 2;` — real, captured failure:

```
error CS0266: Cannot implicitly convert type 'int' to 'Season'. An
explicit conversion exists (are you missing a cast?)
```

Proof the closed set is enforced at compile time, not checked later at
runtime, and proof `int` and `Season` are genuinely different types
despite every member secretly being an `int` underneath — the compiler
still requires an explicit `(Season)2`-style cast, never an implicit
one. Try it yourself in `lab-enum` before deleting it.

### Exercises

- Add a fifth member, `Monsoon`, to `Season`. Rerun the `foreach` loop
  and confirm it appears, in declared position, with no other code
  change.
- Change `current` to `Season.Spring` and predict `(int)current`'s
  value before rerunning — confirm declared order really does start
  counting at `0`.
- Try `Season current = 2;` (a raw `int`, not a `Season` member) and
  read the real compiler error — confirm a `Season` genuinely cannot be
  built from a bare number without an explicit cast.

### Definition of Done

- [ ] You ran the lab yourself and got the exact real output above.
- [ ] You can explain, without re-reading this lesson, why an `enum` is
      safer than a `string` for a closed set of choices.
- [ ] You triggered a real compile error assigning a non-`Season` value
      to a `Season` variable.
- [ ] You completed the three Exercises above.
