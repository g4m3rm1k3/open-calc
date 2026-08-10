# Concept: Access Modifiers (`public` / `internal`)

**What you'll understand by the end:** what `public` and `internal` actually restrict, and why a top-level C# type can't be scoped to "just this file."

**Prerequisites:** `csharp-classes-objects-and-fields.md`; `dotnet-cli-and-project-scaffolding.md` (this example uses a project reference between two scaffolded projects).

## Setup

*(Full walkthrough of these mechanics: `../wpf-lessons/HOW-TO-RUN-EXAMPLES.md`.)*

Two **separate** projects, side by side in your scratch folder (not one
inside the other):
```
dotnet new classlib -n AccessLib -o AccessLib
dotnet new console -n AccessConsumer -o AccessConsumer
dotnet add AccessConsumer reference AccessLib
```
The third command is what makes `AccessConsumer` able to see
`AccessLib`'s `public` types at all — without it, this example's real
compile errors would be a *different* error (a missing reference), not
the access-modifier one this file is actually about.

## The Problem

Not every type in a project is meant to be used by code outside that project — a library needs a way to expose the classes it intends as its real, supported surface while keeping internal helpers genuinely inaccessible to whoever depends on it.

## The Isolated Example

`dotnet new classlib` generated `AccessLib/Class1.cs`. Open it and
**replace its entire contents** with:
```csharp
namespace AccessLib;

public class PublicTool
{
    public string Name() => "PublicTool";
}

class InternalTool
{
    public string Name() => "InternalTool";
}
```
(The filename `Class1.cs` doesn't matter and isn't renamed — per
`../wpf-lessons/HOW-TO-RUN-EXAMPLES.md`, a `.cs` file's name is never
meaningful to the compiler.)

`dotnet new console` generated `AccessConsumer/Program.cs`. Open it and
**replace its entire contents** with:
```csharp
using AccessLib;

PublicTool t = new PublicTool();
Console.WriteLine(t.Name());

InternalTool secret = new InternalTool();
Console.WriteLine(secret.Name());
```

**Real failure, `dotnet run` in `AccessConsumer`:**
```
error CS0122: 'InternalTool' is inaccessible due to its protection level
error CS0122: 'InternalTool.Name()' is inaccessible due to its protection level
```

Removing the `InternalTool` lines and rerunning:
```
PublicTool
```

**What this proves:** `PublicTool` (marked `public`) is usable from the referencing project; `InternalTool` (no modifier at all) is not — even though both live in a project `AccessConsumer` genuinely references and can otherwise see. The restriction is real, compiler-enforced, and scoped to *the project*, not the file: nothing in `AccessLib`'s own code needed to change for `PublicTool` and `InternalTool` to sit in the same file, in the same namespace, with completely different visibility outside that project.

## Mechanical Walkthrough

- `public class PublicTool` — the **`public`** access modifier: this type can be used by code in any project that references this one.
- `class InternalTool` (no modifier written) — a top-level class with no access modifier defaults to **`internal`**: usable anywhere within the same project, invisible to any other project referencing it. There is no modifier that scopes a *top-level* type down to just the file it's written in — `internal` (project-wide) is as narrow as it gets at this level.
- `secret.Name()` failing for the same reason `InternalTool` itself fails: an `internal` type's own members are equally invisible from outside the project, regardless of what access modifier those members carry individually.

## CS Lens

This is **encapsulation** at the project/module boundary: deciding, explicitly, which parts of a codebase are its real public surface versus its own private implementation detail, enforced by the compiler rather than by convention or a comment saying "don't use this."

Also recognized in: Java's `public`/package-private (its own default, conceptually close to `internal`) split, Python's leading-underscore convention (a much weaker, convention-only version of the same idea — Python's interpreter never actually enforces it), JavaScript module exports (only exported names are reachable from outside a module).

## SE Lens

The alternative — making everything `public` by default — costs nothing at first and a great deal later: once any other project depends on a type, changing or removing it risks breaking that dependent, whether or not it was ever meant to be depended on. Defaulting to `internal` and only promoting a type to `public` on purpose keeps a library's real, supported surface small and deliberate — the actual, load-bearing reason library authors do this, not just a style preference.

## Connection

WPF's own generated `MainWindow`/`App` classes are marked `public partial class` for exactly this reason: `App.xaml`'s `StartupUri` and the WPF runtime need to construct them from outside the project's own code (from WPF's own framework assemblies) — `internal` would make that construction impossible.

## Try It Yourself

1. Mark `PublicTool` as `internal` instead of `public`, rebuild `AccessConsumer`, and read the real error — confirm it now fails the same way `InternalTool` did.
2. Add a `public` method to `InternalTool` itself, then try calling it from `AccessConsumer` anyway. Confirm it still fails — proof that a member's own modifier can never widen access beyond what its *containing type's* modifier already allows.
3. Remove the project reference (`dotnet remove AccessConsumer reference AccessLib`) and try building again, referring only to `PublicTool`. Read the real error, and reason about why it's a different error than the `internal` one above — a missing reference and a real access restriction are different failures with different fixes.
