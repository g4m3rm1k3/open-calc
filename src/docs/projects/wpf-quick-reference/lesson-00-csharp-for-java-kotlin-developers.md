# Lesson 00: C# for Java/Kotlin/Python Developers

**What this covers:** every syntax and idiom difference you'll hit in the
first five minutes of reading a real C# file, assuming you already know
what a class, a constructor, an interface, and a loop *are* — from Java,
Kotlin, or Python via this curriculum's Android tracks. Nothing here
re-explains OOP itself. It explains where C#'s spelling of it diverges.

**What you need to know first:** real OOP in any language — classes,
constructors, inheritance, interfaces. Nothing about C# specifically.

---

## `namespace` and `using` — Java's package/import, spelled differently

Java: `package com.example.app;` at the top, `import java.util.List;` per
class you use. Kotlin: same idea, `package`/`import`. C#:

```csharp
using System;
using System.Collections.Generic;

namespace PocketInventory;

public class Item
{
}
```

`using X;` — pulls a **namespace** into scope, same job as Java's `import`,
different keyword. `namespace PocketInventory;` — declares what namespace
this file's contents belong to, same job as Java's `package`, but C# does
**not** require the namespace to match the folder path the way Java
requires the package to match the directory structure. This is the
**file-scoped namespace** form (C# 10+, and what every current .NET
project generates): everything below the `;` is implicitly inside
`PocketInventory` with no `{ }` wrapping it. Older C# code you'll see in
tutorials uses the block form instead — functionally identical, more
indentation:

```csharp
namespace PocketInventory
{
    public class Item
    {
    }
}
```

If your assigned project's files open with `namespace X { ... }` instead
of `namespace X;`, that's this older style, nothing more.

## Properties — not getter/setter methods, a real language feature

Java: a private field plus `getName()`/`setName()` methods, or Kotlin's
`val`/`var` with compiler-generated accessors. C# has this as first-class
syntax called a **property**:

```csharp
public class Item
{
    public string Name { get; set; }
    public string Category { get; private set; }
    public decimal Value { get; set; } = 0m;
}
```

`{ get; set; }` — an **auto-implemented property**: the compiler generates
a hidden backing field and trivial get/set methods for you. Calling code
writes `item.Name = "Drill";` and `var n = item.Name;` — plain field
syntax — but it's really going through a method call underneath, which
matters the moment you want to intercept it:

```csharp
private string _name = "";
public string Name
{
    get => _name;
    set
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Name cannot be blank");
        _name = value;
    }
}
```

This is a **full property**: a real backing field (`_name`, `_`-prefixed
by convention, same convention Kotlin uses for backing fields) plus real
logic in `set`. `value` is a compiler-provided keyword inside a `set`
block — it's automatically bound to whatever was assigned
(`item.Name = "Drill"` makes `value` equal `"Drill"` inside this block).
`get => _name;` is an **expression-bodied member** — shorthand for
`get { return _name; }`, the same `=>` shorthand C#'s lambdas use
(Lesson 00b).

`public string Category { get; private set; }` — mixed accessibility:
readable from anywhere, but only settable from inside this class. This is
the real, idiomatic way C# expresses "read-only from the outside" — Java
usually fakes this with a getter and no setter at all; C# lets you keep
the property syntax while narrowing just one side of it.

**Why this exists as a language feature instead of a convention:** in
Java, `obj.field` and `obj.getField()` are visibly different call shapes,
so a codebase can't switch a plain field to computed logic later without
changing every call site. In C#, `obj.Name` is the *same syntax* whether
`Name` is a bare field-like property or one running real validation —
you can go from auto-property to full property later without touching a
single caller.

## Access modifiers — same four ideas, one default flipped

Java's four levels (`public`, `protected`, package-private/default,
`private`) all exist in C#, spelled the same way except one:

| Java | C# | Meaning |
|---|---|---|
| `public` | `public` | visible everywhere |
| `protected` | `protected` | visible to this class and subclasses |
| *(no keyword)* | `internal` | visible anywhere in this project/assembly — C#'s equivalent of Java's package-private, but scoped to the whole compiled project instead of one folder |
| `private` | `private` | visible only inside this class |

**The trap:** a class or member with no modifier at all defaults to
`public` in an interface's members, but `private` almost everywhere else
in C# — the opposite of Java's "no modifier means package-private, which
reads as fairly open." A field or method written with nothing in front of
it inside an ordinary class is `private`, full stop. Always write the
modifier explicitly rather than relying on the default; it changes
between Java and C#, and between different kinds of C# type.

## `var` — real static typing, inferred, not Python's dynamic typing

```csharp
var name = "Drill";        // inferred as string, fixed forever
var count = 3;              // inferred as int
var items = new List<Item>(); // inferred as List<Item>
```

`var` looks like Python's untyped assignment and is **not** that. The
compiler infers the real, concrete type at compile time from the
right-hand side, then that variable is that type, permanently — `name = 5;`
on the next line is a compile error, exactly as if you'd written
`string name = "Drill";` explicitly. `var` only saves you from typing the
type name twice; it changes nothing about C# being statically typed. One
real gotcha, distinct from Python and worth stating because it's the kind
of thing that silently compiles wrong if you don't know it:

```csharp
var x = 1, y = 2;   // ERROR — does not compile
int x = 1, y = 2;    // fine — var specifically can't do this
```

`var` cannot declare more than one variable in a single statement, unlike
an explicit type. The reason: `var x = 1, y = 2;` would require the
compiler to infer two independent types from one keyword, and C#'s
grammar for `var` doesn't allow it.

## String interpolation — like Python f-strings, Kotlin templates

```csharp
string name = "Drill";
int qty = 3;
Console.WriteLine($"{name} x{qty}");        // "Drill x3"
Console.WriteLine($"{name.ToUpper()}");     // method calls work inside {}
Console.WriteLine($"Total: {qty * 2.5:C}"); // "Total: $7.50" — format specifier
```

The leading `$` before the opening `"` turns on interpolation — without
it, `{name}` is printed literally as four characters. `{expr:C}` — the
`:C` after a colon is a **format specifier**; `C` means "format this
number as currency using the current culture," the direct equivalent of
Python's f-string `:.2f`-style specifiers, different letters, same idea.

## Nullable reference types — the compiler tracking `null` for you

Every current .NET project template sets `<Nullable>enable</Nullable>` in
the `.csproj` (you'll see this in your assigned project's `.csproj` file).
With it on, every reference type is **non-nullable by default**, and the
compiler warns you at the exact line where a `null` could reach code that
doesn't check for it:

```csharp
string name = null;          // compiler warning: converting null to non-nullable type
string? nickname = null;     // fine — the ? opts this specific variable into "may be null"

void Greet(string? n)
{
    Console.WriteLine(n.Length);   // warning: n may be null here
    if (n != null)
        Console.WriteLine(n.Length); // fine — compiler sees the null check
}
```

`string?` (a `?` after any reference type) means "this variable is allowed
to hold `null`; every use of it has to prove it checked first." This is
new relative to Java (whose references are all silently nullable, which is
exactly the bug class — `NullPointerException` — this feature exists to
catch at compile time instead of at runtime) and close to Kotlin's own
`String?` vs `String` distinction, spelled almost identically on purpose.

## `record` and `struct` vs `class` — three kinds of type, not one

Java/Kotlin: mostly just `class` (Java 16+ has `record` too, newer than
most courses cover). C# has three, and an assigned project may use any of
them:

- **`class`** — what you already know: a reference type, lives on the
  heap, compared by identity (`a == b` asks "same object?") unless you
  override that.
- **`struct`** — a **value type**: copied by value on assignment, not by
  reference. `var b = a;` where `a` is a `struct` makes `b` a genuinely
  independent copy — changing `b` afterward never touches `a`. WPF's own
  `SortDescription`, `Point`, `Size`, and `Thickness` are real structs you
  will meet in later lessons; assigning one behaves like assigning an
  `int`, not like assigning a `List<T>`.
- **`record`** — a reference type (like `class`) that the compiler
  auto-generates value-based equality for (`a == b` compares field values,
  not identity) and a few other conveniences (a readable `ToString()`,
  non-destructive `with` copying). Common for immutable data-carrying
  types; you may or may not see one in your assignment.

```csharp
public struct Point3D { public double X, Y, Z; }
public record ItemSnapshot(string Name, decimal Value);

var a = new Point3D { X = 1, Y = 2, Z = 3 };
var b = a;
b.X = 99;
Console.WriteLine(a.X); // 1 — b was a real copy, a is untouched

var s1 = new ItemSnapshot("Drill", 40m);
var s2 = new ItemSnapshot("Drill", 40m);
Console.WriteLine(s1 == s2); // True — record equality compares values
```

## LINQ, at a glance — you will see this everywhere

C#'s built-in query syntax over any collection — the rough equivalent of
Python's list comprehensions plus `filter`/`map`/`sorted`, as real methods
instead of syntax:

```csharp
List<Item> items = GetItems();

var expensive = items.Where(i => i.Value > 100);
var names = items.Select(i => i.Name);
var sorted = items.OrderBy(i => i.Name);
var first = items.FirstOrDefault(i => i.Name == "Drill");
var total = items.Sum(i => i.Value);
```

`i => i.Value > 100` is a **lambda expression**, covered for real in
Lesson 00b — for now, read it as an inline, unnamed function: "given `i`,
evaluate `i.Value > 100`." `Where` filters (Python's `filter`), `Select`
transforms (Python's `map`), `OrderBy` sorts, `FirstOrDefault` returns a
match or `null`/`default` instead of throwing when nothing matches
(Python's `next(iter, default)`). These methods don't run immediately —
**deferred execution**: `expensive` above is a description of a query,
not a computed list, until something actually enumerates it (a `foreach`,
a `.ToList()`). This trips people up exactly once, usually while
debugging why a breakpoint inside a `Where` lambda fires later than
expected — now you know why.

## Connect the pieces

A real property-bearing class, read top to bottom with everything above
named:

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

namespace PocketInventory;

public class Item
{
    public string Name { get; set; } = "";
    public decimal Value { get; set; }
    public string? Notes { get; set; }
}

public class Program
{
    public static void Main()
    {
        var items = new List<Item>
        {
            new Item { Name = "Drill", Value = 89.99m },
            new Item { Name = "Level", Value = 24.50m },
        };

        var expensive = items.Where(i => i.Value > 50).Select(i => i.Name);

        foreach (var name in expensive)
            Console.WriteLine($"Pricier item: {name}");
    }
}
```

`using`/`namespace` (imports, package), auto-properties (`Name`, `Value`),
a nullable reference (`Notes`), `var` inference, string interpolation, and
a LINQ `Where`/`Select` chain — every syntax difference from this lesson,
in one file that actually compiles and runs.

## What trips people up first

- Writing `getName()` out of Java habit instead of the property `Name` —
  it will compile as a method, just not the one WPF's data binding (Lesson
  06) is looking for, which specifically expects a property, not a method.
- Forgetting `string?` on a value you assign `null` to, then fighting a
  wall of nullable-reference compiler warnings until you either add `?`
  or a null check — the compiler is telling you exactly where, read the
  warning text, it names the line.
- Assuming `struct` behaves like `class` on assignment (Java has no
  equivalent — every Java object type is reference-copied) and being
  surprised a copy didn't share state.

## Next

[Lesson 00b — Delegates, Events, and Lambdas](lesson-00b-delegates-events-and-lambdas.md)
covers the one C# mechanism with no close Java/Kotlin equivalent, and it's
the mechanism nearly every WPF interaction in this reference rests on.
