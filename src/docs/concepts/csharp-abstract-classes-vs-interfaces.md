# Concept: `abstract` Classes vs. Interfaces

**What you'll understand by the end:** what `abstract` actually enforces on a class and on a method, real compiler errors proving both, and the concrete, compiler-enforced reason interfaces exist as a separate tool rather than a redundant one — single inheritance versus multiple interface implementation.

**Prerequisites:** `csharp-inheritance.md`, `csharp-virtual-override-polymorphism.md`.

## Setup

```
dotnet new console -o lab-abstract-interfaces
cd lab-abstract-interfaces
```
Replace the generated `Program.cs`'s contents with each example below in turn.

## The Problem

Some base classes describe something that should never exist on its own in a running program — "a shape, with no further detail about what kind" isn't really a thing that should be directly buildable; every real shape is *some* specific kind. Worth having the language enforce that directly, rather than trusting every future derived class to remember to override the method that gives it real meaning.

## The Isolated Example

**First, proving a class can be forbidden from direct instantiation:**
```csharp
Shape shape = new Shape();

abstract class Shape
{
    public abstract double Area();
}
```

**Real, captured failure — `dotnet run`:**
```
Program.cs(1,15): error CS0144: Cannot create an instance of the abstract type or interface 'Shape'
```

**What this proves:** `abstract class Shape` cannot be built with `new`, at all — the compiler refuses, even though `Shape` could otherwise be a perfectly normal class. This is called an **abstract class**: a real, compiler-enforced rule, not a convention some future developer has to remember.

**Now a derived class that forgets to implement the abstract method:**
```csharp
IncompleteShape shape = new IncompleteShape();

abstract class Shape
{
    public abstract double Area();
}

class IncompleteShape : Shape
{
}
```

**Real, captured failure:**
```
Program.cs(8,7): error CS0534: 'IncompleteShape' does not implement inherited abstract member 'Shape.Area()'
```

**What this proves:** `public abstract double Area();` — no body, just a signature — forces every concrete (non-abstract) derived class to provide one, or that derived class itself fails to compile. This is called an **abstract method**. Neither of these two failures is a runtime bug caught by testing — both are caught by the compiler, before the program ever runs once.

**Now the correct, working shape — an abstract class mixing one abstract method with one ordinary, shared method:**
```csharp
List<Shape> shapes = new List<Shape>
{
    new Square(3),
    new Circle(2)
};

foreach (Shape shape in shapes)
{
    shape.Report();
}

abstract class Shape
{
    public void Report()
    {
        Console.WriteLine("--- Reporting a shape ---");
        Console.WriteLine($"Area: {Area()}");
    }

    public abstract double Area();
}

class Square : Shape
{
    private double _side;

    public Square(double side)
    {
        _side = side;
    }

    public override double Area()
    {
        return _side * _side;
    }
}

class Circle : Shape
{
    private double _radius;

    public Circle(double radius)
    {
        _radius = radius;
    }

    public override double Area()
    {
        return Math.PI * _radius * _radius;
    }
}
```

**Real output:**
```
--- Reporting a shape ---
Area: 9
--- Reporting a shape ---
Area: 12.566370614359172
```

**What this proves:** an `abstract` class isn't just "a class you can't build directly" — it's a real, working mix of **shared, already-written behavior** (`Report`, identical for every derived class) and **required, enforced customization points** (`Area`, a different implementation per derived class, but guaranteed to exist by the compiler). `Report` calls `Area()` — an abstract method — and correctly resolves to each derived class's own override, because an abstract method is implicitly `virtual`.

**Now interfaces, contrasted directly.** A class implementing two independent capabilities via interfaces:
```csharp
Boat boat = new Boat();
boat.Float();
boat.Steer();

interface IFloatable
{
    void Float();
}

interface ISteerable
{
    void Steer();
}

class Boat : IFloatable, ISteerable
{
    public void Float()
    {
        Console.WriteLine("Floating.");
    }

    public void Steer()
    {
        Console.WriteLine("Steering.");
    }
}
```

**Real output:**
```
Floating.
Steering.
```

**Now the same idea, attempted with two `abstract` classes instead of two interfaces:**
```csharp
abstract class Floatable
{
    public abstract void Float();
}

abstract class Steerable
{
    public abstract void Steer();
}

class Boat : Floatable, Steerable
{
    public override void Float()
    {
        Console.WriteLine("Floating.");
    }

    public override void Steer()
    {
        Console.WriteLine("Steering.");
    }
}
```

**Real, captured failure:**
```
Program.cs(11,25): error CS1721: Class 'Boat' cannot have multiple base classes: 'Floatable' and 'Steerable'
Program.cs(18,26): error CS0115: 'Boat.Steer()': no suitable method found to override
```

**What this proves:** `Boat : IFloatable, ISteerable` compiles and runs correctly — a class can implement any number of real interfaces at once. `Boat : Floatable, Steerable` fails immediately with a real `CS1721` error — a class can inherit from **exactly one** base class, `abstract` or not, ever — and a cascading `CS0115`, because once the compiler accepts only `Floatable` as the real base, `Steerable`'s `Steer()` is no longer actually inherited for `override` to attach to. This is the concrete, compiler-enforced difference between the two tools, not a matter of style.

## Mechanical Walkthrough

- `abstract class Shape` — marks the class itself as non-instantiable, proven directly by the real `CS0144` error.
- `public abstract double Area();` — no body, ending in `;` like an interface member — proven, by the real `CS0534` error, to be a compiler-enforced requirement on every derived class, not a suggestion.
- `public void Report() { ... Area(); ... }` — an ordinary, non-abstract method on an abstract class, calling an abstract one — legal, and exactly how abstract classes provide real, shared behavior alongside their enforced gaps. Because an abstract method is implicitly `virtual`, `Area()` resolves polymorphically to whichever derived class's `override` actually matches the real object.
- `interface IFloatable { void Float(); }` — a pure contract: a member signature with no implementation and no fields of its own. A class implementing it must supply a real body.
- `class Boat : IFloatable, ISteerable` — a real, working multi-interface implementation, comma-separated — proof a class can implement any number of interfaces at once.
- `class Boat : Floatable, Steerable` — the real `CS1721` restriction: the single-inheritance rule every C# class is silently subject to, revealed only once a second base class is attempted.

## CS Lens

This is the real, mechanical reason interfaces exist as a *separate* tool from `abstract` classes, not a redundant one: **single inheritance, multiple interface implementation** is C#'s actual rule. An `abstract` class is for "these derived classes share real code and form one natural hierarchy" (`Report`, shared for free by every `Shape`). An interface is for "these otherwise-unrelated classes all promise to support one capability" (`IFloatable`, implementable by a boat, a duck, or anything else that can float, with zero shared ancestry required).

Also recognized in: Java (`abstract class` vs. `interface`, identical single-inheritance/multiple-interface split), Swift (`class` inheritance is single, `protocol` conformance is multiple), TypeScript (`class` extends one class, `implements` any number of interfaces) — the same underlying tradeoff, shared code needing exactly one home versus a promised capability needing none, recurring across nearly every mainstream object-oriented language.

## SE Lens

Why not just always use an `abstract` class, since it can do everything an interface does plus provide shared code? Because a class only gets to choose one base class, ever — committing a type's single inheritance slot to an `abstract` class forecloses inheriting from anything else, including some *other* `abstract` class the type might legitimately need later. And why not just always use an interface, since it never costs that slot? Because an interface cannot hold real, shared implementation or fields — every implementing class has to re-provide identical logic itself, the exact duplication inheritance exists to avoid. The honest rule: reach for `abstract` when a real hierarchy with genuinely shared code exists; reach for an interface when the goal is only a promised capability, especially one a type might need to combine with several others at once.

## Connection

This is the reasoning behind any object in a real codebase that implements a capability interface — a UI component announcing that it can be clicked, dragged, or serialized, a data type promising it can be compared or enumerated — while still inheriting from some unrelated base class for its own shared behavior. The single-inheritance/multiple-interface split is exactly what makes both possible on the same object at once.

## Try It Yourself

1. Add a third derived class, `class Triangle : Shape`, with its own `Area()` override. Add it to `shapes` and confirm, with real output, that `Report()` — written once, on the base, before `Triangle` even existed — already works correctly for it with zero changes.
2. Predict, in your own words, whether an `abstract` class can itself implement an interface (for example, `abstract class Shape : IFloatable`) — then test it for real, and note whether `Shape` itself has to implement `IFloatable`'s members, or whether it can leave that requirement to its own derived classes.
3. Add a second interface member to `IFloatable`, `double BuoyancyForce();`, without adding it to `Boat`. Read the real compiler error and confirm an interface's contract is enforced exactly as strictly as an abstract class's abstract methods are.
