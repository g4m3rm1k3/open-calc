# Concept: Constructors

**What you'll understand by the end:** what actually runs when `new ClassName()` is called, and when.

**Prerequisites:** `csharp-classes-objects-and-fields.md`.

## Setup

*(Full walkthrough of these mechanics: `../wpf-lessons/HOW-TO-RUN-EXAMPLES.md`.)*

```
dotnet new console -n CtorDemo -o CtorDemo
cd CtorDemo
```
Replace the generated `Program.cs`'s contents with the example below.

## The Problem

Some setup work genuinely needs to happen every single time a new object is created — no exceptions, no way to forget — before any of that object's own methods are called on it.

## The Isolated Example

In `Program.cs` (replacing the generated `Console.WriteLine("Hello, World!");`):
```csharp
Lamp a = new Lamp();
Console.WriteLine("Program: about to make a second Lamp");
Lamp b = new Lamp();

class Lamp
{
    public Lamp()
    {
        Console.WriteLine("Lamp: a new lamp just turned on");
    }
}
```

**Real output:**
```
Lamp: a new lamp just turned on
Program: about to make a second Lamp
Lamp: a new lamp just turned on
```

**What this proves:** `"Lamp: a new lamp just turned on"` printed *before* the program's own next line each time — proof `Lamp()`'s body runs automatically, synchronously, the instant `new Lamp()` is evaluated, not at some later or deferred point. It printed twice, once per `new Lamp()` call — proof it's not a one-time setup step, but something that runs fresh for every new instance.

## Mechanical Walkthrough

- `public Lamp()` — a **constructor**: a method with the exact same name as its class and no return type (not even `void`). C# recognizes this shape specifically as "the code to run when an object of this type is created."
- `new Lamp()` — the `new` keyword allocates a real object in memory, then immediately calls its constructor before the expression `new Lamp()` produces a usable value at all — proven by the ordering of the printed output above.
- Because no constructor was written by hand for `Lamp` in some other class (e.g. `Program`), and because a class with no constructor written gets a free, empty, parameterless one automatically — `Lamp` here overrides that default with a real one that actually does something.

## CS Lens

This is **object initialization** — guaranteeing a class's own invariants (whatever must be true about an object for its methods to work correctly) are established the moment an instance exists, rather than trusting every caller to remember a separate setup step.

Also recognized in: Python's `__init__` (same guarantee, different name and slightly different mechanics — Python's `__init__` doesn't *return* the object, it initializes one `__new__` already created), Java's identically-shaped constructors, JavaScript's `constructor()` inside a `class`.

## SE Lens

The alternative — a separate `Init()`/`Setup()` method a caller must remember to call after `new` — genuinely happens in older or lower-level code, and it's a real, common source of bugs: an object used before its own setup ran, silently producing wrong behavior instead of a clear failure. A constructor makes "fully set up" and "exists at all" the same moment, by construction, with no separate step a caller can forget.

## Connection

A WPF window's own generated constructor (`public MainWindow() { InitializeComponent(); }`) is this exact mechanism: the one guaranteed place `InitializeComponent()` — building the real visual tree from XAML — is guaranteed to run before the window is used any further.

## Try It Yourself

1. Add a second constructor to `Lamp` that takes a `string` name (`public Lamp(string name)`), printing the name in its message. Call both the parameterless and the new one-argument version from the same program and confirm both really run.
2. Add a real field to `Lamp` (`public bool IsOn = false;`) and set it to `true` inside the constructor. Read it immediately after `new Lamp()` from calling code and confirm it's already `true` — proof the constructor really ran before control returned to the caller.
3. Remove `Lamp`'s constructor entirely (back to the free, compiler-provided default) and confirm `new Lamp()` still works — just silently, with neither printed message.
