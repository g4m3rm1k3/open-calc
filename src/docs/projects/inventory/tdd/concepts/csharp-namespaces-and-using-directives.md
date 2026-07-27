# Concept: Namespaces and `using` Directives

**What you'll understand by the end:** what a C# `namespace` actually groups, and what a `using` directive at the top of a file really does.

**Prerequisites:** none. (Contrast: `python-import-statement.md` — same underlying need, different mechanism.)

## Setup

.NET SDK installed. Two files in one console project.

## The Problem

As a codebase grows, two unrelated pieces of code can easily want the same short name for a class (`Client`, `Logger`, `Handler`). A language needs a way to group related types under a longer, collision-safe name, while still letting code that uses one specific group refer to its contents briefly.

## The Isolated Example

`Greeter.cs`:
```csharp
namespace Greetings
{
    public class Greeter
    {
        public string Hello() => "hello from Greetings.Greeter";
    }
}
```

`Program.cs`, same folder:
```csharp
using Greetings;

Greetings.Greeter fullyQualified = new Greetings.Greeter();
Console.WriteLine(fullyQualified.Hello());

Greeter viaUsing = new Greeter();
Console.WriteLine(viaUsing.Hello());
```

**Real output:**
```
hello from Greetings.Greeter
hello from Greetings.Greeter
```

**What this proves:** `Greetings.Greeter` (the fully-qualified name) and `Greeter` (the short name, only valid because of `using Greetings;` above it) refer to the exact same type — proven by both producing identical output. Removing the `using Greetings;` line and rebuilding, with no other change:

```
error CS0246: The type or namespace name 'Greeter' could not be found
(are you missing a using directive or an assembly reference?)
```

`Greetings.Greeter` alone (the fully-qualified line) still compiles fine — only the short, unqualified `Greeter` stops working. This proves `using` doesn't import code or make it "exist" — the type exists either way; `using` only makes the *short name* legal to write.

## Mechanical Walkthrough

- `namespace Greetings { ... }` — declares that everything inside this block belongs to a named group, `Greetings`. `Greeter`'s real, full identity is `Greetings.Greeter`, not just `Greeter`.
- `using Greetings;` — a **using directive**: tells the compiler "let this file refer to anything inside the `Greetings` namespace by its short name," without changing what that name actually resolves to.
- `Greetings.Greeter fullyQualified = ...` — the fully-qualified form always works, `using` or not; it's never actually required, only more to type.
- `Greeter viaUsing = ...` — the short form, legal here specifically because of the `using` directive above; the compiler-verified error above proves this dependency directly.

## CS Lens

This is a **namespace** operation, in the general computer-science sense: giving two things that might otherwise share a name separate, non-colliding identities, resolved by an explicit grouping rather than hoping names never collide by accident.

Also recognized in: Python's `import module` / `from module import name` (contrast: Python has no `using`-equivalent that's optional the same way — `from X import Y` genuinely binds a new name, where C#'s `using` only unlocks an already-real name), Java's `import` statement, JavaScript/TypeScript's module system.

## SE Lens

Every file needing `Full.Namespace.Path.TypeName` everywhere is unambiguous but genuinely hard to read at any real scale. `using` trades a small, real risk — two `using`d namespaces both containing a same-named type, an actual compile-time ambiguity error when it happens — for dramatically shorter, more readable code in the overwhelmingly common case where no such collision exists.

## Connection

Every generated C# file in a WPF project (`App.xaml.cs`, `MainWindow.xaml.cs`) opens with several `using` directives for exactly this reason — pulling `System.Windows`'s own names (`Window`, `Application`) into scope unqualified.

## Try It Yourself

1. Add a second class, `FarewellTool`, to a *different* namespace in a new file, without a `using` directive for it. Try referring to it by its short name and read the real error; then add the `using` line and confirm it resolves.
2. Create two different namespaces that each define a class named the same thing (e.g. `Greeter`), `using` both in one file, and try referring to `Greeter` unqualified — read the real "ambiguous reference" error, then fix it using a fully-qualified name for one of them.
3. Use `using Greetings;` inside `Program.cs` but delete the `namespace Greetings { }` wrapper from `Greeter.cs` entirely (leaving `public class Greeter` at the top level, no namespace). Rebuild and observe: does `using Greetings;` still compile? Explain why, based on what `using` actually resolves.
