# Concept: `partial` Classes

**What you'll understand by the end:** how two separate files can define pieces of the exact same class, merged by the compiler before anything runs.

**Prerequisites:** `csharp-classes-objects-and-fields.md` (this file assumes "class," "field," and "constructor" are already real, not just familiar-sounding).

## Setup

*(Full walkthrough of these mechanics: `../wpf-lessons/HOW-TO-RUN-EXAMPLES.md`.)*

```
dotnet new console -n PartialDemo -o PartialDemo
cd PartialDemo
```
Two files, both directly in this folder, next to the generated
`Program.cs`: create a **new** file named `Robot.Body.cs` (the exact dot
in that name is cosmetic — see the linked guide if that's not obvious),
and replace `Program.cs`'s own contents. Both examples below.

## The Problem

A single class sometimes needs to be authored across more than one file — generated code in one file, hand-written code in another — without forcing an artificial split into two separately-named types wired together by hand.

## The Isolated Example

`Robot.Body.cs`:
```csharp
partial class Robot
{
    public string Name = "Rex";

    public void Greet()
    {
        System.Console.WriteLine($"{Name} says hi from Body.cs");
    }
}
```

`Program.cs`, same folder:
```csharp
partial class Robot
{
    public void Think()
    {
        System.Console.WriteLine($"{Name} says hi from Brain.cs");
    }
}

class Program
{
    static void Main()
    {
        Robot r = new Robot();
        r.Greet();
        r.Think();
    }
}
```

Run with `dotnet run`.

**Real output:**
```
Rex says hi from Body.cs
Rex says hi from Brain.cs
```

**What this proves:** two separate files, each declaring `partial class Robot`, are really the *same* class — `Think()` (defined in `Program.cs`) reads `Name` (defined in `Robot.Body.cs`) with no error, no import, no reference between the files at all. Without `partial` on both declarations, this is a compile error ("Robot" defined twice, not extended).

## Mechanical Walkthrough

- `partial class Robot` (first file) — `partial` is a real keyword telling the compiler "don't complain that this class is declared more than once elsewhere — merge every `partial` declaration with this same name, in this same namespace, into one class before compiling anything else."
- `public string Name = "Rex";` — an ordinary field, visible to *every* `partial` piece of `Robot`, not just the piece it's declared in.
- `partial class Robot` (second file) — a second piece of the *same* class; `Think()` here can read `Name`, defined in the other file, because after merging there is only ever one real `Robot` class with one field list.
- `class Program { static void Main() { ... } }` — the traditional explicit entry point (as opposed to top-level statements): `Main` is the method the runtime calls first.
- `new Robot()` runs `Robot`'s own default, compiler-generated constructor (no constructor was written by hand here — a class with none gets a free, parameterless one automatically; see `csharp-constructors.md`).

## CS Lens

This is a real instance of **separation of concerns** enforced at the language level rather than the usual file/module level: two files, one real class, each file free to focus on a different piece of that class's behavior.

Also recognized in: any generated-code-plus-hand-written-code pairing (protobuf/gRPC generated stubs extended by hand in many languages), Entity Framework's generated `DbContext` partials, ASP.NET's generated Razor page code-behind.

## SE Lens

The alternative — one file per class, always — is simpler right up until a tool needs to *generate* half a class's contents (a UI designer, a code generator) while a human maintains the other half by hand. Without `partial`, that split forces two separately-named types wired together manually, which drifts out of sync more easily than one real class split by the compiler itself. The cost: two files to keep mentally associated per class, and (for compiler-generated partials specifically) a piece a reader can't `Ctrl+click` into by reading source alone.

## Connection

This is the exact mechanism `xaml-declarative-ui-markup.md` depends on: a WPF window's markup file compiles into one `partial class` piece, merged with a hand-written `.xaml.cs` file's own `partial class` piece, into one real window class.

## Try It Yourself

1. Remove `partial` from just one of the two `class Robot` declarations (leave the other alone) and rebuild — read the real compiler error about `Robot` being defined multiple times.
2. Add a third file, `Robot.Legs.cs`, with a third `partial class Robot` piece containing a `Walk()` method. Call it from `Main` alongside `Greet()`/`Think()` — confirm a class can be split across more than two files.
3. Give both partial pieces a field with the same name (e.g. `Name` in both files). Rebuild and read the real error — confirm the compiler treats this as one real class with one field list, not two independent ones that happen to share a name.
