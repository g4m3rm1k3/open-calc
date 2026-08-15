# Lesson 01: Interfaces and Implementation

**What this covers:** what an interface actually is in C#, what
"implementing" one means, and why a real, unfamiliar API hands you
interfaces constantly instead of concrete classes.

**What you need first:** real classes and objects, in any language —
Python's own `class` is enough.

---

## A class is a real thing. An interface is a promise.

A Python class you write bundles two things together: what an object
*can do* (its methods) and *how* it does them (the real code inside
each method). A C# **interface** splits those apart on purpose — it
declares only the first half:

```csharp
public interface IMachinable
{
    string Name { get; }
    double Volume();
    void Cut(double depth);
}
```

Nothing here has a real body. `IMachinable` is a real, plain
**contract**: "anything that claims to be `IMachinable` has a `Name`
you can read, a `Volume()` method, and a `Cut(depth)` method" — and
that's the entire, complete claim. No real code runs when you look at
this by itself.

A real class **implements** the interface by providing the actual,
real bodies:

```csharp
public class Bracket : IMachinable
{
    public string Name { get; set; }
    public double Volume() => 12.5;
    public void Cut(double depth)
    {
        Console.WriteLine($"Cutting {Name} to depth {depth}");
    }
}
```

`: IMachinable` after the class name is the real, literal syntax for
"I promise to provide everything `IMachinable` requires." If you leave
out `Cut`, this won't compile — C# checks the promise for you, at
compile time, before you ever run the program.

## Why this matters the moment you're reading someone else's API

A real, unfamiliar API — Mastercam's own .NET API is exactly this kind
of example — very often hands you back an **interface type**, not a
concrete class:

```csharp
IMachinable part = mastercamProject.GetSelectedPart();
```

`part`'s own, real, declared type is `IMachinable` — you genuinely do
not know, and don't need to know, what real, concrete class is
actually behind it. It could be `Bracket`, or `Housing`, or a real
class the library's own authors added last year that didn't exist when
this code was written. All you know, and all you need to know, is the
real, promised shape: it has `Name`, `Volume()`, `Cut(depth)`. This is
the entire, real reason libraries do this — the real, concrete
implementation can change freely behind the scenes without breaking
any code written against the interface.

## Interfaces vs. abstract classes — the one real distinction worth knowing now

You will see both real terms in documentation. The short, practical
version: an **interface** is a pure promise, no real code inside it at
all (a small number of narrow exceptions exist in modern C#, not worth
worrying about yet). An **abstract class** can hold some *real,
shared* code, plus some real, unfilled-in blanks:

```csharp
public abstract class MachinableBase
{
    public string Name { get; set; }
    public double Volume() => ComputeVolume(); // real, shared logic

    protected abstract double ComputeVolume(); // a real blank, filled in below
}

public class Bracket : MachinableBase
{
    protected override double ComputeVolume() => 12.5;
}
```

If a real, unfamiliar type in an API's documentation says
`abstract class`, expect some real, working logic already provided for
you. If it says `interface`, expect nothing but the shape.

## Checking what something actually is at runtime

Given a real, unfamiliar object typed as an interface, you can ask
what it *really* is underneath, the same real instinct as Python's own
`isinstance()`:

```csharp
if (part is Bracket bracket)
{
    Console.WriteLine($"This is really a Bracket: {bracket.Name}");
}
```

`is` checks the real, underlying type and, if it matches, hands you a
real, correctly-typed variable (`bracket`) in the same expression —
you don't need a separate cast afterward.

## Definition of done

- [ ] You wrote a real interface and a real class implementing it, and
      it compiled.
- [ ] You deliberately left one required member off the class and saw
      the real, compile-time error naming exactly what's missing.
- [ ] You can state, in your own words, why a real API hands you an
      interface-typed value instead of a concrete class.
- [ ] You used `is` to check a real object's actual, underlying type.

## Next

[Lesson 02 — Reading an Unfamiliar Type's Shape](lesson-02-reading-an-unfamiliar-types-shape.md)
gives you the real, remaining vocabulary — properties, method
signatures, overloads, and generics — needed to read a real
interface's own documentation without guessing.
