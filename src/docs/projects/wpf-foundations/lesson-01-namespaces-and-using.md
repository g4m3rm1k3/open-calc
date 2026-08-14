# Lesson 01: Namespaces and `using`

**What you will build:** a tiny, disposable two-file console program,
proving for real what `using` actually does and why C# doesn't require a
namespace to match a folder path the way Java requires a package to
match a directory. The transferable problem: every language needs some
way to let two unrelated pieces of code both name a type `Item` without
colliding — this lesson is about C#'s specific answer.

**What you need to know first:** real OOP from Java or Kotlin — classes,
packages/imports, nothing C#-specific assumed.

**Terms introduced in this lesson:**
- **`namespace`** — a named grouping of types, C#'s tool for avoiding
  name collisions between unrelated pieces of code that happen to use the
  same type name.
- **`using` directive** — brings a namespace's types into scope in the
  current file so they can be referenced by their short name instead of
  their full, namespace-qualified name.
- **File-scoped namespace** — the `namespace X;` form (no braces), where
  everything below the line belongs to that namespace, as opposed to the
  older `namespace X { ... }` block form.
- **Fully qualified name** — a type's complete name including every
  namespace it's nested inside, joined by dots (`System.Console`), always
  valid even with no `using` directive for that namespace at all.

**Objects and methods used:**

**`System.Console`**
- *What it is:* .NET's built-in class for reading from and writing to the
  console — the real class backing `Console.WriteLine`, which this
  lesson's lab calls directly.
- *Implementation:* a `static` class (Lesson 06 covers `static` in depth;
  for now: called on the type itself, `Console.WriteLine(...)`, never
  `new Console().WriteLine(...)`) living in the `System` namespace.
- *Its use:* the one piece of output this lesson's isolated lab needs to
  prove anything at all.

---

## Concept Unit: `namespace` — Grouping Types So Names Don't Collide

### The Problem

Two unrelated pieces of code — a shipping module and a chess module, say
— might each reasonably want a class named `Board`. Java solves this with
packages, matched to a real folder structure on disk
(`com.example.shipping.Board` has to live in a folder path matching that
dotted name exactly). C# needs the same kind of solution, but with a
detail worth proving rather than assuming: does C#'s version have that
same folder-must-match-name requirement?

### Introduce the Concept in Isolation

Two disposable files, in the **same folder**, each declaring a type named
`Board` inside a different namespace:

```csharp
// ShippingBoard.cs
namespace Shipping;

public class Board
{
    public string Describe() => "A shipping board: tracks packages.";
}
```

```csharp
// ChessBoard.cs
namespace Chess;

public class Board
{
    public string Describe() => "A chess board: 8x8 squares.";
}
```

```csharp
// Program.cs
using Shipping;

public class Program
{
    public static void Main()
    {
        var board = new Board();
        System.Console.WriteLine(board.Describe());
    }
}
```

Output:
```
A shipping board: tracks packages.
```

This proves the real mechanism: `Program.cs` writes plain `Board` with no
namespace prefix and gets `Shipping.Board`, not `Chess.Board` — the
compiler resolved the short name `Board` by checking which namespaces are
brought into scope via `using`, found only `Shipping` listed, and picked
that one. Change the `using` line to `using Chess;` instead, recompile
with no other change, and the exact same `new Board()` line resolves to
the *other* class — proof that `using` is doing real, load-bearing
resolution work, not just a cosmetic import statement. This mechanism is
called a **`using` directive**, and the grouping itself is a
**namespace**.

**The folder question, answered directly:** all three files above sit in
the same folder, with no `Shipping/` or `Chess/` subdirectory anywhere —
and it compiles and runs correctly regardless. Unlike Java, where
`package com.example.shipping;` requires the file to physically live at
a matching folder path (the compiler enforces it), C#'s `namespace` is
purely a logical label with **no required relationship to the file's
location on disk at all**. A large real C# project's folder structure
usually *does* mirror its namespaces, by convention and for the same
readability reason Java projects do it — but nothing in the compiler
requires it, which is worth knowing before assuming a C# file has to live
in a specific folder just because of what its `namespace` line says.

### Discard

`Shipping`/`Chess`/this throwaway `Board` pair are deleted now — they
exist only to prove `using`'s resolution mechanism and the
no-folder-requirement fact. Neither reappears in any later lesson.

### Mechanical Walkthrough

- `namespace Shipping;` — **(a) first appearance.** The **file-scoped
  namespace** form: no `{ }` block, and everything below this line, for
  the rest of the file, belongs to `Shipping`. This is C# 10+ syntax and
  what every current .NET project template generates.
- `public class Board` — **(c) already basic**, ordinary class
  declaration, no new explanation owed (real OOP, assumed known).
- `public string Describe() => "...";` — **(a) first appearance** of one
  specific piece of syntax: `=>` here is an **expression-bodied member**
  — shorthand for `public string Describe() { return "..."; }`. The
  method itself (a `string`-returning method with no parameters) is
  ordinary OOP, already known; only this specific arrow shorthand is new.
- `using Shipping;` — **(a) first appearance.** Brings every `public`
  type inside the `Shipping` namespace into scope for the rest of this
  file, so `Board` (rather than the longer `Shipping.Board`) resolves
  correctly.
- `public static void Main()` — **(c) already basic** as a concept (an
  entry-point method, same idea as Java's `public static void main`);
  the capitalization (`Main`, not `main`) is the one real difference,
  worth a clause: C# method names are conventionally
  PascalCase (`Main`, `WriteLine`), not Java's camelCase
  (`main`, `println`).
- `new Board();` — **(c) already basic**, ordinary object construction.
- `System.Console.WriteLine(board.Describe());` — **(a) first
  appearance** of the specific name `System.Console`, written here as its
  **fully qualified name** (`System.Console`, not just `Console`)
  specifically because this file has no `using System;` directive at the
  top — proof that a fully qualified name always works, with or without
  a matching `using`, while the short form only works once the matching
  `using` is present. `board.Describe()` — **(c) already basic**, an
  ordinary method call on an already-known object.

### SE Lens

The real alternative C# could have chosen — requiring folder structure to
match namespace, the way Java does — trades one real cost for one real
benefit: Java's rule makes "where does this class physically live"
answerable purely from its declared package name, with zero ambiguity,
at the cost of the file system layout and the logical grouping being
permanently welded together (you cannot reorganize one without touching
the other). C#'s looser rule keeps logical grouping (namespace) and
physical organization (folder layout) as two independent decisions —
useful when a large refactor wants to reshuffle folders without
renaming every namespace, or vice versa — at the real cost named above:
nothing in the compiler stops a `Shipping`-namespaced file from living
in a folder called `random_stuff/`, which a reader can no longer infer
just from the folder tree.

## Connect the pieces

One trace: two unrelated classes named `Board`, in two different
namespaces, sitting in the very same folder with no collision, because
`using Shipping;` told the compiler which one the short name `Board`
should resolve to in this specific file — and `System.Console.WriteLine`
proved a fully qualified name works regardless, with no `using` needed at
all.

## What breaks without this

Delete `using Shipping;` from `Program.cs` entirely, leaving `new
Board();` as the only reference, with both `Shipping.Board` and
`Chess.Board` still present in the same folder. This does not compile:

```
error CS0246: The type or namespace name 'Board' could not be found
(are you missing a using directive or an assembly reference?)
```

With no `using` bringing either namespace into scope, and two types
named `Board` existing, the compiler has no default to fall back on —
`Board` alone is genuinely ambiguous/unresolvable, and it says so
directly. Restoring `using Shipping;` (or writing the fully qualified
`Shipping.Board` directly, with no `using` at all) fixes it.

## Exercises

1. Add `using Chess;` as a *second* `using` line, alongside `using
   Shipping;`, leaving `new Board();` unchanged. Predict whether this
   compiles before checking — then compile it and see what real message
   the compiler gives when a short name is ambiguous *between two
   `using`-imported* namespaces (a different failure than the one above,
   where neither was imported at all).
2. Rewrite `Program.cs`'s `Main` to construct *both* `Board`s in the same
   method, using each one's fully qualified name (`Shipping.Board`,
   `Chess.Board`) instead of relying on `using` for either — confirm both
   print their own correct `Describe()` text with no `using` directive
   for either namespace present at all.

## Definition of Done

- [ ] You compiled and ran the three-file `Shipping`/`Chess` example
      yourself and saw `Shipping.Board`'s output print.
- [ ] You changed `using Shipping;` to `using Chess;` with no other edit
      and confirmed the *other* class's output printed instead.
- [ ] You caused the real `CS0246` failure above and understood why it
      names "missing a using directive" specifically.
- [ ] You can state, in your own words, the one real difference between
      C#'s `namespace` and Java's `package` regarding folder structure.

## Next

[Lesson 02 — Properties as a Real Language Feature](lesson-02-properties.md)
covers the first genuinely new *language feature* in this series — not a
spelling difference like `namespace`/`package`, but syntax with no direct
Java equivalent at all.
