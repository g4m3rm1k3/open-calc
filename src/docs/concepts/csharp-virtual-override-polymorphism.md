# Concept: `virtual` / `override` and Polymorphism

**What you'll understand by the end:** why re-declaring a method with the same name in a derived class does not replace the base class's version, what `virtual` and `override` actually change about how a method call is resolved, and what polymorphism means in concrete, mechanical terms rather than as a vocabulary word.

**Prerequisites:** `csharp-inheritance.md`.

## Setup

```
dotnet new console -o lab-polymorphism
cd lab-polymorphism
```
Replace the generated `Program.cs`'s contents with the example below.

## The Problem

A derived class sometimes needs to change what an inherited method does — not just add new members, but genuinely replace an existing one's behavior. The obvious-looking approach is to just write a new method with the same name directly on the derived class. That compiles. It does not do what it looks like it does, and the failure is invisible unless the calling code is tested through a variable typed as the *base* class, which is exactly the shape most real code takes — a list, a parameter, a return type declared as the general case, holding a specific case underneath.

## The Isolated Example

In `Program.cs`:
```csharp
List<Shape> shapes = new List<Shape>
{
    new Shape(),
    new Square()
};

Console.WriteLine("Looping over List<Shape>:");
foreach (Shape shape in shapes)
{
    shape.Describe();
}

class Shape
{
    public void Describe()
    {
        Console.WriteLine("This is a generic shape.");
    }
}

class Square : Shape
{
    public void Describe()
    {
        Console.WriteLine("This is a square.");
    }
}
```

**Real output — `dotnet run`:**
```
Program.cs(23,17): warning CS0108: 'Square.Describe()' hides inherited member 'Shape.Describe()'. Use the new keyword if hiding was intended.
Looping over List<Shape>:
This is a generic shape.
This is a generic shape.
```

**What this proves:** the compiler itself flags the mistake before the program even runs — `CS0108`, naming exactly what's about to happen: `Square.Describe()` **hides** the base method instead of replacing it. Both loop iterations print `"This is a generic shape."`, even the second one, which is really holding a `Square` — `Square`'s own `Describe()`, the one that would print `"This is a square."`, never runs at all through this loop. This is called **method hiding**: a real, second, unrelated method sharing a name with the base one, selected by the *declared type of the reference* (`Shape`, for every slot in this list) rather than the object's real type.

Now the real fix — add `virtual` to the base method and `override` to the derived one, with no other change to the calling code:

```csharp
List<Shape> shapes = new List<Shape>
{
    new Shape(),
    new Square()
};

Console.WriteLine("Looping over List<Shape>:");
foreach (Shape shape in shapes)
{
    shape.Describe();
}

class Shape
{
    public virtual void Describe()
    {
        Console.WriteLine("This is a generic shape.");
    }
}

class Square : Shape
{
    public override void Describe()
    {
        Console.WriteLine("This is a square.");
    }
}
```

**Real output — `dotnet run`:**
```
Looping over List<Shape>:
This is a generic shape.
This is a square.
```

**What this proves:** the identical `foreach (Shape shape in shapes) { shape.Describe(); }` — not one character of the calling code changed — now correctly runs each object's own real behavior. No compiler warning this time. Only the two class declarations changed: `virtual` on the base, `override` on the derived. This is **polymorphism**: code written against a base type, calling a `virtual` method, automatically runs whichever derived class's `override` actually matches the object's real type at runtime, without that code ever checking or caring which derived type it's really holding.

## Mechanical Walkthrough

- `public void Describe()` on `Square`, with no `virtual` on the base and no `override` here (first version) — legal C#, but not what "replace the base method" usually means in practice; this is **method hiding**.
- `List<Shape> shapes`, holding a real `Square` inside a `Shape`-typed slot — every slot's *declared* type is `Shape`, even the one actually holding a `Square`. This is the exact mechanical reason the bug happens: an ordinary (non-`virtual`) method call is resolved using the reference's **declared type**, decided at compile time, never the object's real type.
- The `CS0108` warning — a compiler warning, not an error: the program still compiles and runs, but almost certainly not the way the author intended. Worth treating as seriously as an error.
- `public virtual void Describe()` (second version) — marks the base class method as one a derived class is explicitly allowed to replace. Without this, `override` on a derived class is not even legal C#.
- `public override void Describe()` (second version) — replaces the base's `virtual` method for real. Requires an exact signature match against the base's `virtual` (or another `override`); the compiler checks this, unlike the loose, name-only match method hiding silently allows.
- `shape.Describe()`, unchanged between both runs — the only thing different between the two real runs is two keywords, `virtual` and `override`, proving the *calling* code never needs to change to benefit from polymorphism.

## CS Lens

This is **dynamic dispatch** (also called **late binding**): the actual method that runs is decided at runtime, based on the object's real type — the opposite of the ordinary method-resolution rule (decided at compile time, based on the reference's declared type) that produces method hiding's silent bug. `virtual` is what tells the compiler "generate code that checks the real type at runtime for this one," instead of the plain, compile-time-only method lookup every non-`virtual` method uses.

Also recognized in: nearly every general-purpose object-oriented language has some form of this — Java's methods are `virtual` by default (must be marked `final` to opt *out*), C++ requires an explicit `virtual` keyword much like C#, Python's methods are always dynamically dispatched with no keyword needed at all. The underlying idea — "the real object decides which code runs, not the type of the variable holding it" — recurs across every one of them.

## SE Lens

Why does C# require an explicit `virtual`/`override` at all, instead of always replacing a base method automatically whenever a derived class redeclares one with the same name? Because automatic replacement would be a real, silent risk: a base class author adding a brand-new method later could accidentally collide with an unrelated method some totally different derived class already had, silently changing that derived class's behavior with no warning at all. Requiring `virtual` on the base is the base class author's explicit promise — "this specific method is safe to replace." `override` on the derived class is the derived author's explicit acknowledgment — "I am replacing that exact one, on purpose." The cost: every method that should be replaceable has to be marked in advance, which means a base class author has to anticipate, ahead of time, which of their own methods derived classes will legitimately need to change.

## Connection

This is the mechanism underneath any framework class a program is told to subclass and override a lifecycle method on — a UI framework calling an overridden setup or teardown method on a specific window or component, a game engine calling an overridden update method on a specific entity type. The framework's own code only ever calls the method through the base type; `virtual`/`override` is what makes the correct, specific override actually run, without the framework ever needing to know the specific derived type exists.

## Try It Yourself

1. Add a third class, `class Triangle : Shape`, overriding `Describe()` again. Add one to `shapes` and confirm, with real output, that the loop picks its override too.
2. Predict, in your own words, what happens if `Square.Describe()` is marked `override` but `Shape.Describe()` is **not** marked `virtual` — then try it and read the real compiler error.
3. Inside `Square`'s `override void Describe()`, call `base.Describe();` as its first line, before printing its own message. Confirm, with real output, that both the base's text and the derived text print, in that order — a real, common pattern: extend the base behavior instead of fully replacing it.
