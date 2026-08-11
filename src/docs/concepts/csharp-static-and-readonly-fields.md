# Concept: `static` and `readonly` Fields

**What you'll understand by the end:** two separate field modifiers that are often used together and easy to conflate — `static` (a field belongs to the class itself, not to any one object) and `readonly` (a field can only be assigned once, inside a constructor) — proven independently, with real, contrasting output for each.

**Prerequisites:** `csharp-classes-objects-and-fields.md`, `csharp-constructors.md`.

## Setup

```
dotnet new console -o lab-static-readonly
cd lab-static-readonly
```
Replace the generated `Program.cs`'s contents with each example below in turn.

## The Problem

Every object built from a class normally gets its own independent copy of every field. Two genuinely different, unrelated needs don't fit that default: sometimes one single piece of data should be shared by *every* object of a class, with no independent copies at all; and separately, sometimes a field should never change after an object is built, with nothing about a plain field stopping it from being reassigned later, accidentally or otherwise.

## The Isolated Example

**First, `static` — belonging to the class, not the object:**
```csharp
Ticket a = new Ticket();
Ticket b = new Ticket();
Ticket c = new Ticket();

Console.WriteLine($"a.Number = {a.Number}");
Console.WriteLine($"b.Number = {b.Number}");
Console.WriteLine($"c.Number = {c.Number}");
Console.WriteLine($"Ticket.IssuedCount = {Ticket.IssuedCount}");

class Ticket
{
    public static int IssuedCount = 0;
    public int Number;

    public Ticket()
    {
        IssuedCount = IssuedCount + 1;
        Number = IssuedCount;
    }
}
```

**Real output — `dotnet run`:**
```
a.Number = 1
b.Number = 2
c.Number = 3
Ticket.IssuedCount = 3
```

**What this proves:** `Number` behaves the way ordinary fields always do — each object holds its own, independent `1`/`2`/`3`. `IssuedCount` behaves completely differently: it isn't accessed as `a.IssuedCount` at all — `Ticket.IssuedCount`, accessed on the *class itself*, correctly shows `3` — proof there is exactly one `IssuedCount` in the entire program, incremented by all three constructor calls in turn, not three separate copies.

#### Execution Trace

1. `Ticket a = new Ticket();` — the constructor runs: `IssuedCount` goes from its starting value `0` to `1`, because this is the *first* constructor call in the whole program; `a.Number` is then set to that same `1`.
2. `Ticket b = new Ticket();` — a *different* object is built, but the constructor reads and writes the *same* `IssuedCount` field — it goes `1 → 2`, because step 1 already left it at `1`, not because `b` somehow inherited a fresh counter; `b.Number` is set to `2`.
3. `Ticket c = new Ticket();` — same mechanism again, `IssuedCount` goes `2 → 3`; `c.Number` is set to `3`.
4. `Ticket.IssuedCount` (final read) — shows `3`, the cumulative result of all three constructor calls sharing one field — proving the field truly persists across every construction, not reset per object the way `Number` is.

**Now `readonly` — assignable once, then locked.** First, the illegal attempt:
```csharp
Badge badge = new Badge("EMP-001");
Console.WriteLine(badge.Id);
badge.Id = "EMP-999";

class Badge
{
    public readonly string Id;

    public Badge(string id)
    {
        Id = id;
    }
}
```

**Real, captured failure:**
```
Program.cs(3,1): error CS0191: A readonly field cannot be assigned to (except in a constructor or init-only setter of the type in which the field is defined or a variable initializer)
```

Removing the illegal line:
```csharp
Badge badge = new Badge("EMP-001");
Console.WriteLine(badge.Id);
```

**Real output:**
```
EMP-001
```

**What this proves:** assigning `Id` **inside** the constructor (`Id = id;`) compiles and works fine — that's the one place `readonly` allows an assignment. Assigning it from anywhere else, including the exact same field on the exact same object from outside the class, is a real compile-time error, not a runtime one — caught before the program ever runs at all.

## Mechanical Walkthrough

- `public static int IssuedCount = 0;` — the `static` keyword: this field belongs to `Ticket` the class, not to any individual `Ticket` object. There is exactly one `IssuedCount` in the entire running program, no matter how many `Ticket`s exist.
- `IssuedCount = IssuedCount + 1;` (inside the constructor) — every constructor call reads and writes the *same* shared value — this is *why* it reaches `3` after three constructions, not `1` three times.
- `Number = IssuedCount;` — copies the shared counter's *current* value into this one object's own instance field at the moment of construction — after this line runs, `Number` is an independent snapshot, no longer connected to future changes in `IssuedCount`.
- `Ticket.IssuedCount` — accessing a `static` member through the class name, never through an object — `a.IssuedCount` would not compile.
- `public readonly string Id;` — `readonly`: this field may be assigned only inside its own declaration or inside a constructor of `Badge` — never anywhere else, ever, enforced by the compiler.
- `Id = id;` (inside the constructor) — legal, because this is exactly the one place `readonly` permits an assignment.
- `badge.Id = "EMP-999";` (outside the class, after construction) — illegal, proven by the real `CS0191` error — `readonly` doesn't care that this is "the same field on the same object"; the rule is about *where* the assignment happens, not *what value* it sets.

## CS Lens

`static` is **class-level (shared) state** versus **instance-level (per-object) state** — the same distinction exists in nearly every class-based language; `static` in C# and Python's own class-attribute-versus-instance-attribute split are the same idea, different syntax. `readonly` is **immutability enforced by the compiler** rather than by convention or documentation — the same broader idea Python's own `@dataclass(frozen=True)` reaches for, except here the guarantee is real and checked, not just implied.

Also recognized in: a running total of every object of some type ever created (`static`); constants and configuration values fixed once at startup (`readonly`); a value representing something in the real world that genuinely cannot change after creation, like a manufacture serial number (`readonly`).

## SE Lens

For `static`: the alternative — a global variable outside any class — would work mechanically the same way, but loses the connection to `Ticket` specifically; nothing about the name or location signals "this is `Ticket`'s own shared counter." `static` keeps shared state logically scoped to the class it's actually about, discoverable by reading that class alone. For `readonly`: the alternative — an ordinary mutable field, trusted by convention never to be reassigned — relies on every future reader of every future line of code remembering that convention correctly, forever. `readonly` converts "please don't change this" into "the compiler won't let you," at zero runtime cost — the check happens once, at compile time. The two are frequently combined on the same field (`private static readonly`) — one shared value, set once, never reassigned — because the two guarantees are independent and stack cleanly.

## Connection

A field declared `private static readonly`, holding a single shared lookup table or configuration value built once and never reassigned, is this exact combination — `static` for "one copy, shared everywhere," `readonly` for "locked after that one copy is built."

## Try It Yourself

1. Add a second `static` field, `public static int LastSerialNumber = 0;`, updated the same way `IssuedCount` is. Confirm both shared fields track correctly across the same three constructions.
2. Change `Ticket`'s constructor to *not* update `IssuedCount` (comment out that line) and confirm every `Ticket.Number` becomes `0` — proof `Number`'s correctness depended entirely on the shared counter actually being updated, not on anything automatic.
3. Try declaring `public static readonly int MaxTickets = 100;` and confirm it can be read as `Ticket.MaxTickets` (via the class, like any `static` member) but never reassigned, anywhere, once the program is running — the two modifiers stacking their separate guarantees on one field.
