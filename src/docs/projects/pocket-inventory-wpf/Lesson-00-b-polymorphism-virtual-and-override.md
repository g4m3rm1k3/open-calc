# Lesson 00b: The Method That Changes Depending on What It Really Is

*(Prepended before Lesson 0, directly after Lesson 0a — see
`CURRICULUM_NOTES.md`'s 2026-07-31 audit. Lesson 0a proved inheritance
gives a derived class every field and method a base class has "for
free." This lesson proves something Lesson 0a deliberately stopped
short of: a derived class can *change* what an inherited method does,
and — this is the part that genuinely surprises people — simply
re-declaring the method is not how you do that.)*

**Developer Story**
> As a developer who just learned inheritance, I want to understand why
> "just write a new version of the method in the derived class" doesn't
> actually work the way it sounds like it should — and what the real
> fix is.

**What you will build**
Nothing that survives — every example here is thrown away once proven,
same as Lesson 0a. What you'll walk away with: a real, tested
understanding of `virtual` and `override`, and a genuine bug, caused on
purpose, that most C# beginners hit by accident at some point without
ever fully understanding why it happened.

**What you need to know first**
Lesson 0a: `class`, `object`, `new`, constructor, `: BaseClass`
inheritance, base class/derived class.

**Terms introduced in this lesson:**
- **Method hiding** — declaring a method in a derived class with the
  same name as one on the base class, *without* `virtual`/`override`.
  It compiles, but it does not replace the base method — it creates a
  second, unrelated method that happens to share a name, selected by
  the *reference's declared type*, not the object's real type.
- **`virtual`** — a modifier on a base class method, marking it as one
  a derived class is explicitly allowed to replace.
- **`override`** — a modifier on a derived class method, replacing a
  base class's `virtual` method for real — selected by the object's
  *actual* type, no matter what type of reference is used to call it.
- **Polymorphism** — the result of `virtual`/`override`: code written
  against a base class type, calling a `virtual` method, automatically
  runs whichever derived class's `override` actually matches the real
  object at runtime — without that code ever checking or caring which
  derived type it's holding.

**Objects and methods used**
- **`List<Lightbulb>`** — a real, generic, growable collection type from
  .NET's base class library (`System.Collections.Generic`), used here
  purely as a vehicle to hold several bulbs at once — this lesson's own
  subject is what happens when they're looped over, not the list itself,
  which gets its own full, from-scratch treatment in Lesson 6. `new
  List<Lightbulb> { new Lightbulb(true), new SmartLightbulb(true) }` —
  the `{ ... }` immediately after the constructor call is a **collection
  initializer**: sugar that adds each listed value to the new list, in
  order, right after it's constructed, equivalent to constructing an
  empty list and calling `.Add(...)` once per value.
- **`foreach (Lightbulb bulb in bulbs)`** — a loop that runs its body
  once per element in `bulbs`, in order, binding `bulb` to the current
  element each time — no manual index or `.Count` check needed, unlike a
  plain `for` loop. `bulb`'s declared type here is `Lightbulb`, matching
  the list's own element type, which is the exact mechanical reason this
  unit's bug happens at all (see the Execution Trace below).

---

## Concept Unit: Re-Declaring a Method Doesn't Replace It

### The Problem

Lesson 0a's `SmartLightbulb` inherited `Describe()` from `Lightbulb`
unchanged. A real smart bulb's description should probably say more
than a plain bulb's — the obvious-looking fix is just writing a new
`Describe()` method directly on `SmartLightbulb`. Worth testing that
directly, in the specific way a real program would actually use it:
through a mixed collection of bulbs, not just one bulb called by name.

### Introduce the Concept in Isolation
```bash
dotnet new console -o PolyLab
```

Replace `Program.cs`:

```csharp
List<Lightbulb> bulbs = new List<Lightbulb>
{
    new Lightbulb(true),
    new SmartLightbulb(true)
};

Console.WriteLine("Looping over List<Lightbulb>:");
foreach (Lightbulb bulb in bulbs)
{
    bulb.Describe();
}

class Lightbulb
{
    public bool IsOn;

    public Lightbulb(bool startsOn)
    {
        IsOn = startsOn;
    }

    public void Describe()
    {
        Console.WriteLine($"This bulb is {(IsOn ? "on" : "off")}");
    }
}

class SmartLightbulb : Lightbulb
{
    public SmartLightbulb(bool startsOn) : base(startsOn)
    {
    }

    public void Describe()
    {
        Console.WriteLine($"This is a smart bulb, currently {(IsOn ? "on" : "off")}");
    }
}
```

Run it:

```bash
dotnet run
```

Real output:

```text
Program.cs(34,17): warning CS0108: 'SmartLightbulb.Describe()' hides inherited member 'Lightbulb.Describe()'. Use the new keyword if hiding was intended.
Looping over List<Lightbulb>:
This bulb is on
This bulb is on
```

#### Execution Trace

1. `bulbs` holds two real, different objects — a plain `Lightbulb` and
   a `SmartLightbulb` — but the list itself is typed `List<Lightbulb>`,
   so every slot's *declared* type is `Lightbulb`, even the one
   actually holding a `SmartLightbulb`.
2. The compiler itself flags this before the program even runs: `warning
   CS0108`, naming exactly what's about to happen — `SmartLightbulb`'s
   `Describe()` **hides** the base one rather than replacing it.
3. `foreach (Lightbulb bulb in bulbs)` — each loop variable `bulb` is
   typed `Lightbulb`, regardless of which real object it's holding.
4. `bulb.Describe()`, called twice — prints `"This bulb is on"` **both
   times**, even for the second iteration, which is really holding a
   `SmartLightbulb`. `SmartLightbulb`'s own `Describe()` — the one that
   would print `"This is a smart bulb..."` — never runs at all here.

*What this proves:* re-declaring `Describe()` in `SmartLightbulb`,
without `virtual`/`override`, does not replace the base method for code
that only knows about the `Lightbulb` type — it creates a second,
separate method, and which one runs is decided by the *reference's
declared type* (`Lightbulb`, for every entry in this list), not the
*object's real type*. This is called **method hiding**, and the
compiler's own warning already told you it happened — worth reading
compiler warnings, not just errors.

### Discard the Throwaway Example
Keep `PolyLab` open — the fix, next, reuses this exact file.

### Mechanical Walkthrough

- `public void Describe()` on `SmartLightbulb`, with no `virtual` on the
  base and no `override` here — **first appearance of method hiding.**
  Legal C#, but not what "override the base method" usually means in
  practice.
- `List<Lightbulb> bulbs`, holding a real `SmartLightbulb` inside a
  `Lightbulb`-typed slot — reappearing shape (Lesson 0a's own
  `CS1061` proof already established a `SmartLightbulb` *is a*
  `Lightbulb`); this unit is the first place that "is a" relationship
  is stored in a *collection* rather than called by name directly.
- The `CS0108` warning text itself — **first appearance of a compiler
  warning (not error) in this project's curriculum**, distinct from
  every previous proof, which used either real output or a hard compile
  error. A warning means "this compiles and runs, but probably isn't
  what you meant" — worth treating as seriously as an error, here.

### CS Lens

This is exactly why the fix isn't "just write the method again" — C#
resolves an ordinary (non-`virtual`) method call using the **declared
type of the reference**, decided at compile time, not the object's real
type, decided at runtime. `bulb.Describe()` compiles by asking "what
does `Lightbulb` say `Describe()` is?" — and since `Lightbulb` itself
was never told its `Describe()` might be replaced, the answer never
changes, no matter what real object `bulb` happens to be holding.

### SE Lens

Why does C# require an explicit `virtual`/`override` at all, instead of
always replacing a base method automatically whenever a derived class
redeclares one with the same name? Because automatic replacement would
be a real, silent risk: a base class author adding a brand new method
later could accidentally collide with an unrelated method a totally
different derived class already had, silently changing that derived
class's behavior with no warning. Requiring `virtual` on the base is
the base class author's explicit promise — "this specific method is
safe to replace" — and `override` on the derived class is the derived
author's explicit acknowledgment — "I am replacing that exact one, on
purpose."

### Connection

The fix — `virtual` on the base, `override` on the derived — is one
keyword each, applied to this exact same file, next.

---

## Concept Unit: `virtual` and `override` — Replacing a Method for Real

### The Problem

Method hiding compiles and runs, but silently does the wrong thing the
moment code only knows about the base type — exactly the shape most
real code takes (a list, a parameter, a return type — all typed as the
general case, holding specific cases underneath). Worth proving the
real fix produces different, correct output on the identical program.

### Introduce the Concept in Isolation

In the same `PolyLab` project, add `virtual` to `Lightbulb.Describe()`
and `override` to `SmartLightbulb.Describe()`:

```csharp
class Lightbulb
{
    public bool IsOn;

    public Lightbulb(bool startsOn)
    {
        IsOn = startsOn;
    }

    public virtual void Describe()
    {
        Console.WriteLine($"This bulb is {(IsOn ? "on" : "off")}");
    }
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
```

Run it again — same `List<Lightbulb>`, same `foreach`, no other changes:

```bash
dotnet run
```

Real output:

```text
With virtual/override:
This bulb is on
This is a smart bulb, currently on
```

#### Execution Trace

1. `bulbs` is unchanged — still a `List<Lightbulb>` holding one
   `Lightbulb` and one `SmartLightbulb`, both accessed through
   `Lightbulb`-typed slots, exactly as before.
2. `bulb.Describe()`, first iteration (the real `Lightbulb`) — prints
   `"This bulb is on"`, unchanged from before; there is no override to
   run for an object that really is just a `Lightbulb`.
3. `bulb.Describe()`, second iteration (the real `SmartLightbulb`,
   still accessed through a `Lightbulb`-typed `bulb`) — now prints
   `"This is a smart bulb, currently on"` — `SmartLightbulb`'s own
   `override` ran, even though `bulb`'s *declared* type never changed.
4. No compiler warning this time — `virtual`/`override` is exactly the
   explicit, on-purpose replacement the compiler was warning about the
   absence of before.

*What this proves:* `virtual` on `Lightbulb.Describe()` and `override`
on `SmartLightbulb.Describe()` change *how* the method call is
resolved — no longer decided by `bulb`'s declared type at compile time,
but by the real object's actual type at runtime. This is called
**polymorphism** — the identical loop, over the identical
`List<Lightbulb>`, now correctly runs each object's own real behavior,
without ever needing to check or care which derived type it's actually
holding.

### Discard the Throwaway Example
Delete the `PolyLab` folder. `virtual`/`override` are not discarded —
this project's own WPF base classes already use this mechanism, next.

### Mechanical Walkthrough

- `public virtual void Describe()` — **first appearance of `virtual`.**
  A base class method marked as explicitly replaceable — without this,
  `override` on a derived class is not even legal C#.
- `public override void Describe()` — **first appearance of
  `override`.** Requires an exact signature match against a `virtual`
  (or another `override`) on the base; the compiler checks this, unlike
  the loose, name-only match method hiding silently allowed.
- The exact same `foreach (Lightbulb bulb in bulbs) { bulb.Describe(); }`
  from the previous unit, unchanged — the only thing different between
  the two real runs is two keywords, `virtual` and `override`, proving
  the *calling* code never needs to change to benefit from polymorphism.

### CS Lens

This is **dynamic dispatch** (also called **late binding**): the actual
method that runs is decided at runtime, based on the object's real
type, rather than at compile time, based on the reference's declared
type — the exact opposite of the resolution rule the previous unit's
CS Lens named for ordinary methods. `virtual` is what tells the
compiler "generate code that checks the real type at runtime for this
one," instead of the plain, compile-time-only method lookup every other
method in this project has used since Lesson 0a.

### SE Lens

Where has this project already been relying on polymorphism without
ever naming it? `public partial class MainWindow : Window` (Lesson 0/1)
overrides real WPF methods like `OnClosing` far more often than most
WPF code ever notices — WPF's own event-handling machinery calls
`Window`-typed code, and `virtual`/`override` is exactly why a specific
`MainWindow`'s own overridden behavior runs instead of `Window`'s
generic default, every single time, without WPF's internal code ever
needing to know a `MainWindow` specifically exists. Lesson 0a's own
Connection section already named this relationship; this lesson is what
makes it mechanically true rather than asserted.

### Connection

Every lesson from Lesson 0 onward that overrides a WPF-provided method
(rare in this project, but real — `Page`'s navigation lifecycle is
built on exactly this) is quietly relying on this exact mechanism. The
next new lesson in this sequence turns to a different tool for
"promising a capability without providing it yet" — `abstract` classes
and the interfaces this project has already used since Lesson 7.

---

## Closing

### Connect the Pieces

`Lightbulb.Describe()`, marked `virtual`, and `SmartLightbulb.Describe()`,
marked `override`, together change *how* a method call resolves — from
the reference's declared type (ordinary methods, proven broken for this
exact use case in this lesson's first unit) to the object's real,
runtime type (polymorphism, proven correct in the second). The same
`List<Lightbulb>`, the same `foreach`, the same `bulb.Describe()` call
— completely unchanged — produced two different, real outputs, because
only the *class declarations* changed. This is the entire point:
calling code written against a base type never needs to know which
derived type it's really holding.

### What Breaks Without This

Already demonstrated directly, on purpose, in this lesson's first unit:
looping over `List<Lightbulb>` with a merely-hidden (not overridden)
`Describe()` silently prints the base class's own text for *every*
entry, including ones that are really a more specific type — a real,
silent bug, not a compile error, exactly the kind that's easy to ship
without noticing. No further break-it exercise needed this lesson.

### Exercises

- In a fresh `PolyLab`, add a third class, `class ColorLightbulb :
  SmartLightbulb`, overriding `Describe()` again. Add one to `bulbs` and
  confirm, with real output, that the loop picks *its* override too —
  polymorphism working through two levels of inheritance, not just one.
- Predict, in your own words, what happens if `SmartLightbulb.Describe()`
  is marked `override` but `Lightbulb.Describe()` is **not** marked
  `virtual` — then try it and read the real compiler error.
- In `SmartLightbulb`'s `override void Describe()`, call `base.Describe();`
  as its first line, before printing its own message. Confirm, with real
  output, that both the base's text and the derived text print, in that
  order — a real, common pattern (extend the base behavior, don't fully
  replace it).

### Definition of Done

- [ ] You ran both real versions of `PolyLab` yourself — the
      method-hiding version (getting the real `CS0108` warning and the
      wrong, repeated output) and the `virtual`/`override` version
      (getting the correct, distinct output) — not just read them here.
- [ ] You can explain, in your own words and without re-reading this
      lesson, why `bulb.Describe()` resolves differently with and
      without `virtual`/`override`, given the exact same `bulb` variable
      and the exact same call.
- [ ] You completed the `base.Describe()` exercise and confirmed, with
      real output, that a derived override can extend rather than fully
      replace its base's behavior.
