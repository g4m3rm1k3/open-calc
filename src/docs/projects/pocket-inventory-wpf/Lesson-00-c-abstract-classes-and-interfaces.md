# Lesson 00c: A Promise a Base Class Can't Keep Itself

*(Prepended before Lesson 0, directly after Lesson 0b — see
`CURRICULUM_NOTES.md`'s 2026-07-31 audit. `INotifyPropertyChanged`
(Lesson 7), `IDataErrorInfo` (Lesson 11), and `ICommand` (Lesson 23) all
get implemented, by name, well before this lesson — the *how* and *why*
of interfaces is left implicit until now. This lesson makes it explicit,
and introduces the other real half of C#'s abstraction toolkit:
`abstract` classes, which look similar but behave, and are used, quite
differently.)*

**Developer Story**
> As a developer about to implement several interfaces this project
> already relies on, I want to understand what a class that can't be
> instantiated is actually for, and why C# has two separate tools —
> `abstract` classes and interfaces — for what sounds like the same
> idea.

**What you will build**
Nothing that survives — every example here is thrown away once proven,
same as Lessons 0a/0b. What you'll walk away with: real, tested proof
of what `abstract` actually enforces, and a real, direct answer to "why
not just always use an abstract class" and its mirror, "why not just
always use an interface."

**What you need to know first**
Lesson 0a: class, object, inheritance, base/derived class. Lesson 0b:
`virtual`, `override`, polymorphism.

**Terms introduced in this lesson:**
- **`abstract` class** — a class that cannot be directly instantiated
  with `new`, meant only to be inherited from.
- **`abstract` method** — a method declared on an `abstract` class with
  no body at all — a required signature every non-abstract derived
  class must `override`, enforced by the compiler, not just documented.
- **Interface** — a pure contract: a list of members a class promises
  to provide, with no implementation and no fields of its own. A class
  can implement any number of interfaces, but inherit from only one
  base class (`abstract` or not).

**Objects and methods used**
- No new supporting cast beyond this lesson's own subject —
  `List<Lightbulb>`, the collection-initializer syntax, `foreach`, and
  `Console.WriteLine` all reappear from Lessons 0a/0b, which already
  gave each full treatment.

---

## Concept Unit: `abstract` — A Base Class That Refuses to Stand Alone

### The Problem

`Lightbulb` (Lessons 0a/0b) is a real, useful base class — but "a
lightbulb, with no further detail about what kind" isn't really a thing
that should exist on its own in a running program; every real bulb is
*some* specific kind. Worth having the language enforce that directly,
rather than just trusting every future derived class to remember to
override `Describe()` properly.

### Introduce the Concept in Isolation
```bash
dotnet new console -o AbstractLab
```

Replace `Program.cs`:

```csharp
Lightbulb bulb = new Lightbulb(true);

abstract class Lightbulb
{
    public bool IsOn;

    public Lightbulb(bool startsOn)
    {
        IsOn = startsOn;
    }

    public abstract void Describe();
}
```

Run it:

```bash
dotnet run
```

Real, captured failure:

```text
error CS0144: Cannot create an instance of the abstract type or interface 'Lightbulb'
```

*What this proves:* `abstract class Lightbulb` cannot be built with
`new`, at all, even though it has a perfectly normal constructor — the
compiler refuses before the constructor is ever relevant. This is called
an **abstract class** — a real, enforced rule, not a convention some
future developer has to remember.

Now try a derived class that forgets to implement `Describe()`:

```csharp
IncompleteBulb bulb = new IncompleteBulb(true);

abstract class Lightbulb
{
    public bool IsOn;

    public Lightbulb(bool startsOn)
    {
        IsOn = startsOn;
    }

    public abstract void Describe();
}

class IncompleteBulb : Lightbulb
{
    public IncompleteBulb(bool startsOn) : base(startsOn)
    {
    }
}
```

Real, captured failure:

```text
error CS0534: 'IncompleteBulb' does not implement inherited abstract member 'Lightbulb.Describe()'
```

*What this proves:* `public abstract void Describe();` — no body, just
a signature — forces every concrete (non-abstract) derived class to
provide one, or the derived class itself fails to compile. This is
called an **abstract method**. Neither of these two real failures is a
runtime bug caught by testing — both are caught by the compiler, before
the program ever runs once.

Now the correct, working shape — an abstract class with one abstract
method *and* one ordinary, fully-implemented method, shared by every
derived class:

```csharp
List<Lightbulb> bulbs = new List<Lightbulb>
{
    new SmartLightbulb(true),
    new ColorLightbulb(true)
};

foreach (Lightbulb bulb in bulbs)
{
    bulb.Announce();
}

abstract class Lightbulb
{
    public bool IsOn;

    public Lightbulb(bool startsOn)
    {
        IsOn = startsOn;
    }

    public void Announce()
    {
        Console.WriteLine("--- Announcing a bulb ---");
        Describe();
    }

    public abstract void Describe();
}

class SmartLightbulb : Lightbulb
{
    public SmartLightbulb(bool startsOn) : base(startsOn)
    {
    }

    public override void Describe()
    {
        Console.WriteLine($"This is a smart bulb, currently {(IsOn ? "on" : "off")}");
    }
}

class ColorLightbulb : Lightbulb
{
    public ColorLightbulb(bool startsOn) : base(startsOn)
    {
    }

    public override void Describe()
    {
        Console.WriteLine($"This is a color bulb, currently {(IsOn ? "on" : "off")}");
    }
}
```

Real output:

```text
--- Announcing a bulb ---
This is a smart bulb, currently on
--- Announcing a bulb ---
This is a color bulb, currently on
```

#### Execution Trace

1. `bulbs` holds a `SmartLightbulb` and a `ColorLightbulb`, both
   accessed through `Lightbulb`-typed slots — the exact shape Lesson
   0b's polymorphism proof already used.
2. `bulb.Announce()`, first iteration — `Announce` is an ordinary,
   fully-implemented method on `Lightbulb` itself (not `abstract`), so
   it runs identically for every bulb: prints the header, then calls
   `Describe()`.
3. `Describe()`, called from inside `Announce()` — resolves
   polymorphically (Lesson 0b), running `SmartLightbulb`'s own
   `override`, printing `"This is a smart bulb, currently on"`.
4. Second iteration — identical `Announce()` header, but `Describe()`
   now resolves to `ColorLightbulb`'s own `override`.

*What this proves:* an `abstract` class isn't just "a class you can't
build directly" — it's a real, working mix of **shared, already-written
behavior** (`Announce`, identical for every derived class) and
**required, enforced customization points** (`Describe`, a different
implementation per derived class, but guaranteed to exist by the
compiler). Every derived class gets `Announce` for free and *must*
supply its own `Describe`.

### Discard the Throwaway Example
Keep `AbstractLab` open — the interface comparison, next, reuses this
same project.

### Mechanical Walkthrough

- `abstract class Lightbulb` — **first appearance of `abstract` on a
  class.** Marks the class itself as non-instantiable — proven directly
  by the real `CS0144` error above.
- `public abstract void Describe();` — **first appearance of `abstract`
  on a method.** No body, ending in `;` like an interface member —
  proven, by the real `CS0534` error, to be a compiler-enforced
  requirement on every derived class, not a suggestion.
- `public void Announce() { ... Describe(); ... }` — an ordinary,
  non-abstract method on an abstract class, calling an abstract one —
  legal, and exactly how abstract classes provide real, shared
  behavior alongside their enforced gaps.

### CS Lens

An `abstract` method is implicitly `virtual` — Lesson 0b's polymorphism
rule (dispatch by the object's real type, not the reference's declared
type) applies to it automatically, which is *why* `Announce()`, defined
once on the base, still calls the correct derived `Describe()` for
whichever real object it's running on. `abstract` and `virtual` are
closely related, not two unrelated ideas: `abstract` means "`virtual`,
with no default implementation at all, and derived classes are required
to supply one."

### SE Lens

Why not just make `Describe()` `virtual` with some default body, like
Lesson 0b did, instead of `abstract` with none? Because Lesson 0b's
`Lightbulb` genuinely was a sensible thing to have on its own — a plain
bulb needing no special description. This project's version says the
opposite on purpose: there is no sensible generic `Describe()` for "a
lightbulb, unspecified" — forcing every derived class to supply one, and
forbidding `Lightbulb` itself from ever being built directly, is a
deliberate, honest design choice, not an accident.

### Connection

Every derived class here still inherits from exactly one base,
`Lightbulb`. The next unit checks whether a class can be built from more
than one `abstract` class the same way `DimmableColorBulb` might need
both "can be dimmed" and "can change color" — and contrasts that
directly against interfaces, which this project has already used
several of.

---

## Concept Unit: Interfaces vs. `abstract` Classes — Contract vs. Partial Implementation

### The Problem

A `DimmableColorBulb` genuinely needs two independent capabilities —
dimming and color-changing. `abstract` classes worked well for one
shared hierarchy (`Lightbulb`, in the previous unit) — worth checking
directly whether the same tool extends to combining two *unrelated*
capabilities on one class.

### Introduce the Concept in Isolation

In the same `AbstractLab` project, replace `Program.cs`:

```csharp
interface IDimmable
{
    void Dim();
}

interface IColorChangeable
{
    void ChangeColor();
}

class DimmableColorBulb : IDimmable, IColorChangeable
{
    public void Dim()
    {
        Console.WriteLine("Dimming.");
    }

    public void ChangeColor()
    {
        Console.WriteLine("Changing color.");
    }
}

DimmableColorBulb bulb = new DimmableColorBulb();
bulb.Dim();
bulb.ChangeColor();
```

Run it:

```bash
dotnet run
```

Real output:

```text
Dimming.
Changing color.
```

Now the same idea, attempted with two `abstract` classes instead of two
interfaces:

```csharp
abstract class Dimmable
{
    public abstract void Dim();
}

abstract class ColorChangeable
{
    public abstract void ChangeColor();
}

class DimmableColorBulb : Dimmable, ColorChangeable
{
    public override void Dim()
    {
        Console.WriteLine("Dimming.");
    }

    public override void ChangeColor()
    {
        Console.WriteLine("Changing color.");
    }
}
```

Real, captured failure:

```text
error CS1721: Class 'DimmableColorBulb' cannot have multiple base classes: 'Dimmable' and 'ColorChangeable'
```

*What this proves:* `DimmableColorBulb : IDimmable, IColorChangeable`
compiles and runs correctly — a class can implement any number of real
interfaces at once. `DimmableColorBulb : Dimmable, ColorChangeable`
fails immediately with a real `CS1721` error — a class can inherit from
**exactly one** base class, `abstract` or not, ever. This is the
concrete, compiler-enforced difference between the two tools, not a
matter of style.

### Discard the Throwaway Example
Delete the `AbstractLab` folder. Neither `Lightbulb` nor
`DimmableColorBulb` will appear again — but interfaces themselves
already have, repeatedly, in this project's own real code.

### Mechanical Walkthrough

- `class DimmableColorBulb : IDimmable, IColorChangeable` — a real,
  working multi-interface implementation, comma-separated exactly like
  this project's own `public class InventoryViewModel : INotifyPropertyChanged`
  (Lesson 7) — currently only one interface there, but the comma-list
  syntax is the same one this unit just proved scales to several.
- `class DimmableColorBulb : Dimmable, ColorChangeable` — **first
  appearance of the real `CS1721` restriction** — the single-inheritance
  rule this project's own `InventoryViewModel` (a plain `class`, not
  `abstract`) has been silently subject to since Lesson 7, without ever
  needing a second base class to reveal it.

### CS Lens

This is the real, mechanical reason interfaces exist as a *separate*
tool from `abstract` classes, not a redundant one: **single
inheritance, multiple interface implementation** is C#'s actual rule.
An `abstract` class is for "these derived classes share real code and
form one natural hierarchy" (`Lightbulb`'s `Announce`, shared for free).
An interface is for "these otherwise-unrelated classes all promise to
support one capability" (`IDimmable`, implementable by a lightbulb, a
thermostat, or anything else that can be dimmed, with zero shared
ancestry required).

*See also:* `csharp-abstract-classes-vs-interfaces.md` — a standalone,
project-independent treatment of this exact contrast, with its own
fresh `CS0144`/`CS0534`/`CS1721` proofs.

### SE Lens

This project's own real interfaces already made this choice, once each,
without ever explaining it until now: `INotifyPropertyChanged` (Lesson
7) is a capability — "this object can announce changes" — implementable
by `InventoryViewModel` and, in principle, by any other class in the
project, with no shared base required. `IDataErrorInfo` (Lesson 11) and
`ICommand` (Lesson 23) are the same shape — a promised capability, not a
shared ancestor. None of the three could have been `abstract` classes
instead, not as a style preference, but because `InventoryViewModel`
would then need to have chosen exactly one of them as its single real
base class, and lost the other two entirely.

### Connection

Every interface this project implements from here forward —
`ICommand` (Lesson 23), `IUndoableCommand` (Lesson 45) — is doing
exactly what this unit just proved: promising a capability, without
requiring or providing a shared ancestor.

---

## Closing

### Connect the Pieces

`abstract class Lightbulb` (first unit) cannot be built directly — real,
proven by the `CS0144` compiler error — and its `abstract void Describe()`
forces every derived class to supply an implementation, real, proven by
the `CS0534` error a class that forgets it produces. Combined with an
ordinary, shared method (`Announce`), an `abstract` class is a working
mix of free shared code and enforced customization. The second unit's
real, contrasting `CS1721` error is the concrete reason this project
reaches for interfaces instead: `InventoryViewModel : INotifyPropertyChanged`
(Lesson 7) is only possible, later, alongside no other base class ever
being required, because `INotifyPropertyChanged` is an interface, not
an `abstract` class.

### What Breaks Without This

Already demonstrated three times, on purpose, in this lesson: building
an `abstract` class directly (`CS0144`), forgetting to implement an
`abstract` method (`CS0534`), and trying to inherit from two base
classes at once (`CS1721`) — three real, compiler-caught mistakes, not
silent runtime bugs. No further break-it exercise needed this lesson.

### Exercises

- In a fresh `AbstractLab`, add a *third* derived class,
  `class RgbwLightbulb : Lightbulb`, with its own `Describe()`
  override. Add it to `bulbs` and confirm, with real output, that
  `Announce()` — written once, on the base, before `RgbwLightbulb` even
  existed — already works correctly for it with zero changes.
- Predict, in your own words, whether an `abstract` class can itself
  implement an interface (for example, `abstract class Lightbulb :
  IDimmable`) — then test it for real, and note whether `Lightbulb`
  itself has to implement `IDimmable`'s members, or whether it can leave
  that requirement to its own derived classes.
- Look at `InventoryViewModel : INotifyPropertyChanged` (Lesson 7) and,
  in your own words, explain why turning `INotifyPropertyChanged` into
  an `abstract` class instead would be a real, structural risk for this
  project specifically: if a future lesson ever needed
  `InventoryViewModel` to inherit from some other shared base class (a
  common `ViewModelBase`, for example), what happens to
  `INotifyPropertyChanged` the moment that base class also isn't an
  interface?

### Definition of Done

- [ ] You ran all three real failures yourself (`CS0144`, `CS0534`,
      `CS1721`) and read the actual compiler output, not just this
      lesson's transcription of it.
- [ ] You ran the working `abstract` class version and the working
      multi-interface version, both for real, and can explain why one
      compiles with two "base"-like things and the other doesn't.
- [ ] You can state, from memory, the one-sentence rule: single
      inheritance, multiple interface implementation.
