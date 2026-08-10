# Concept: Classes, Objects, and Fields

**What you'll understand by the end:** what a `class` actually is, what `new` actually does, and why two objects built from the same class don't share their own data.

**Prerequisites:** basic functions, basic data types, basic loops. Nothing else — this is the first appearance of "class" and "object" as ideas, not a C#-specific gloss on something already known.

## Setup

*(Full walkthrough of these mechanics: `../wpf-lessons/HOW-TO-RUN-EXAMPLES.md`.)*

```
dotnet new console -n ClassDemo -o ClassDemo
cd ClassDemo
```
Replace the generated `Program.cs`'s contents with the example below.

## The Problem

A function can group *behavior* (a sequence of steps) under one name, but it has no way to group *behavior together with data that behavior needs to remember* — and a real program usually needs many separate things of the same kind (many dogs, many windows, many bank accounts), each with its own separate values, running the same behavior.

## The Isolated Example

In `Program.cs` (replacing the generated `Console.WriteLine("Hello, World!");`):
```csharp
class Dog
{
    public string Name = "";

    public void Bark()
    {
        System.Console.WriteLine($"{Name} says woof!");
    }
}

class Program
{
    static void Main()
    {
        Dog a = new Dog();
        a.Name = "Rex";

        Dog b = new Dog();
        b.Name = "Fido";

        a.Bark();
        b.Bark();

        System.Console.WriteLine($"a.Name is still: {a.Name}");
    }
}
```

**Real output:**
```
Rex says woof!
Fido says woof!
a.Name is still: Rex
```

**What this proves:** `a` and `b` are two separate things, each really holding its own `Name` — setting `b.Name = "Fido"` had no effect on `a.Name`, proven directly by the final line still reading `"Rex"`. Both `a.Bark()` and `b.Bark()` ran the *exact same* code (the one `Bark` method written once, inside `Dog`), but each run printed a different name — the same behavior, applied to two different pieces of data.

## Mechanical Walkthrough

- `class Dog { ... }` — a **class**: a blueprint describing what every `Dog` will have (a `Name`) and what every `Dog` will be able to do (`Bark()`). Writing `class Dog` does not create a dog — it only describes what one *would* look like, the same way a blueprint for a house isn't itself a house.
- `public string Name = "";` — a **field**: a named piece of data every object built from this class gets its own separate copy of. `= ""` gives it a starting value (an empty string) so it always holds something valid, even before it's explicitly set.
- `public void Bark() { ... }` — a **method**: a function that belongs to the class, with automatic access to *that specific object's own* fields — inside `Bark`, `Name` means "whichever object's `Bark()` is currently running's own `Name`," not some fixed, shared value.
- `Dog a = new Dog();` — `new Dog()` is what actually builds a real **object** (also called an **instance**) from the `Dog` blueprint — a real, distinct thing in memory, with its own copy of `Name`. `Dog a = ...` stores it under the name `a`.
- `a.Name = "Rex";` — the `.` reaches into the specific object `a` refers to and sets *its own* `Name` field — `b`'s `Name` is a completely separate piece of memory, untouched by this line.
- `a.Bark();` — calls the `Bark` method, specifically on `a` — this is *why* it prints `"Rex"` and not `"Fido"`: `Bark`'s `Name` resolves to `a`'s own field, because `a` is the object this particular call is running against.

## CS Lens

This is the foundational idea of **object-oriented programming**: bundling data (fields) and the behavior that operates on that data (methods) into one unit (a class), then creating many independent instances of that unit, each with its own copy of the data. A class is the *template*; an object is one *real thing* built from that template — the same relationship a cookie cutter (one shape, reused) has to the actual cookies it cuts (many, each a separate piece of dough).

Also recognized in: essentially every general-purpose programming language in current use has some form of this — the vocabulary (`class`/`object`, "instance," "field"/"member"/"property") stays close to identical across almost all of them, so this exact mental model transfers directly once learned here.

## SE Lens

The alternative — using separate, unconnected variables for every dog (`dog1Name`, `dog2Name`, a `Bark1()` function, a `Bark2()` function...) — falls apart the moment a program needs an unknown number of dogs, or needs to pass "a dog" around as a single value. A class lets code write `Bark()`'s logic exactly once and reuse it correctly against any number of separately-created objects, each supplying its own data automatically through `this` (the implicit "which object is this method running on" — not shown by name in this lab, since `Name` alone already resolves correctly, but the real mechanism underneath `a.Bark()` reaching `a`'s own field).

## Connection

This is the concept `../wpf-lessons/README.md`'s own stated floor ("basic functions, basic data types, basic loops — nothing else") explicitly does *not* include — every C#/WPF concept file that mentions a `class`, a `field`, a `constructor`, or `new SomeType()` (`csharp-partial-classes.md`, `csharp-constructors.md`, `csharp-access-modifiers.md`, `xaml-x-name-and-generated-fields.md`, and others) depends on this file's own vocabulary being real and understood first.

## Try It Yourself

1. Add a second field, `public int Age = 0;`, set different ages on `a` and `b`, and print both inside `Bark()` alongside `Name` — confirm each object's `Age` is exactly as independent as its `Name` already proved to be.
2. Create a third `Dog c = new Dog();` and call `c.Bark()` *without* ever setting `c.Name`. Confirm it prints an empty name rather than crashing — proof the `= ""` default really is used when nothing else is set.
3. Add a second method, `Sit()`, that also prints `Name`. Call `a.Sit()` and confirm it correctly prints `"Rex"` with no extra work — every method on a class automatically has the same access to that object's own fields, not just the one method already written.
