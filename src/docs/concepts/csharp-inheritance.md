# Concept: Inheritance (`: BaseClass`)

**What you'll understand by the end:** what it actually means for one class to inherit from another, and what a derived class gets for free versus what it has to define itself.

**Prerequisites:** `csharp-classes-objects-and-fields.md`.

## Setup

*(Full walkthrough of these mechanics: `../wpf-lessons/HOW-TO-RUN-EXAMPLES.md`.)*

```
dotnet new console -n InheritDemo -o InheritDemo
cd InheritDemo
```
Replace the generated `Program.cs`'s contents with the example below.

## The Problem

Two classes are sometimes genuinely related — every `Dog` really is a kind of `Animal`, and shares real things with every other `Animal` (a name, the ability to eat) — but writing `Name` and `Eat()` again inside `Dog`, word for word, duplicates something that's already fully described elsewhere.

## The Isolated Example

In `Program.cs` (replacing the generated `Console.WriteLine("Hello, World!");`):
```csharp
class Animal
{
    public string Name = "";

    public void Eat()
    {
        System.Console.WriteLine($"{Name} is eating.");
    }
}

class Dog : Animal
{
    public void Bark()
    {
        System.Console.WriteLine($"{Name} says woof!");
    }
}

class Program
{
    static void Main()
    {
        Dog d = new Dog();
        d.Name = "Rex";
        d.Eat();
        d.Bark();
    }
}
```

**Real output:**
```
Rex is eating.
Rex says woof!
```

**What this proves:** `Dog` never declares a `Name` field or an `Eat()` method anywhere in its own body — yet `d.Eat()` runs successfully and correctly prints `"Rex is eating."` `Dog : Animal` really did give `Dog` everything `Animal` has, for free, with zero code duplicated.

Reversing the relationship — building a plain `Animal` and calling `.Bark()` on it — fails to compile:
```
error CS1061: 'Animal' does not contain a definition for 'Bark'
```
**What this proves:** inheritance only flows one direction. `Dog` gained everything `Animal` has; `Animal` gained nothing from `Dog` — `Animal` has no idea `Dog`, or `Bark()`, even exist.

## Mechanical Walkthrough

- `class Dog : Animal` — the colon means **inheritance**: `Dog` is declared as a more specific version of `Animal`. Every `Dog` *is an* `Animal`, plus whatever extra `Dog` itself adds.
- `Name` and `Eat()`, used inside `Dog`'s own `Bark()` method and from `Main` via `d.Eat()`, with no re-declaration anywhere in `Dog` — this is **inherited membership**: a field or method declared once, on the **base class** (`Animal`), is automatically usable on any object of a **derived class** (`Dog`), as if it had been written there directly.
- `Dog d = new Dog();` — building a `Dog` builds one real object that has *both* `Animal`'s fields/methods and `Dog`'s own — there is no separate, second `Animal` object hiding inside it; it's one object, with a combined set of capabilities.
- `Animal a = new Animal(); a.Bark();` (the broken variant) — fails because the relationship is not symmetric. `Animal` was written with no knowledge that `Dog` — or anything inheriting from it — would ever exist.

## CS Lens

This is **inheritance**, one of the core mechanisms of object-oriented programming: defining a new class in terms of an existing one, reusing its members instead of re-declaring them, and expressing a genuine "is a more specific kind of" relationship between two classes rather than just "these two classes happen to look similar."

Also recognized in: nearly every general-purpose object-oriented language has some form of this, using very similar vocabulary (base/parent/super class, derived/child/sub class) — the concept, once real here, transfers directly.

## SE Lens

The alternative — copying `Name`/`Eat()`'s code into `Dog`, and into every other kind of animal a program might need (`Cat`, `Bird`, ...) — means a later fix to how `Eat()` works has to be repeated, correctly, in every single copy, or the copies quietly drift apart. Inheritance keeps genuinely shared behavior in exactly one place; the real cost is that a derived class's full behavior is no longer visible in one file — reading `Dog` alone doesn't show you `Eat()` exists at all, only that `Bark()` does, which is why the **Parent Contract Rule** (naming the base class's own real shape explicitly, rather than leaving a reader to infer it) matters the moment a class inherits from something whose own source isn't shown right there.

## Connection

Directly used by `wpf-lessons/lesson-01`: `public partial class MainWindow : Window` is this exact mechanism — `MainWindow` inherits every capability a real WPF `Window` already has, which is *why* setting `this.Title`, `this.Height`, etc. all work on `MainWindow` with no code in `MainWindow.xaml.cs` ever defining them.

## Try It Yourself

1. Add a `Sleep()` method to `Dog` itself (not `Animal`) and confirm `d.Sleep()` works — then confirm a plain `Animal` object still cannot call `.Sleep()`, reinforcing the one-directional proof above.
2. Add a second derived class, `Cat : Animal`, with its own `Meow()` method. Confirm a `Cat` object can call `.Eat()` too, with no code shared between `Dog` and `Cat` directly — both only share code *through* `Animal`.
3. Add a field directly to `Dog` (e.g. `public string Breed = "";`) and confirm a plain `Animal` object has no `Breed` field at all — proof that fields added to a derived class stay on that derived class, not retroactively on the base.
