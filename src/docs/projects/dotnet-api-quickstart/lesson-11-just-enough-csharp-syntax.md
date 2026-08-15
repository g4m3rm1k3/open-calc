# Lesson 11: Just Enough C# Syntax

**What this covers:** the small, real syntax and semantic differences
from Python that matter most once you're actually reading real code —
static typing, value vs. reference types, namespaces, access
modifiers, and `this`.

**What you need first:** real, working Python experience. Nothing else
in this series — this lesson is a reference, useful to revisit anytime.

---

## Every real variable has a fixed, real type

```csharp
int depth = 5;
string name = "Bracket";
var count = 3; // var infers the real type (int) at compile time — still fixed after
```

`var` looks dynamic but isn't — the real, actual type is decided once,
at compile time, from whatever's on the right-hand side, and can never
change after. Unlike Python, `depth` can never later hold a `string` —
the real compiler rejects it before your code ever runs. This is the
real, single biggest mental shift from Python: a huge, real category
of bugs Python only catches at runtime, C# refuses to even compile.

## Value types vs. reference types

```csharp
int a = 5;
int b = a;
b = 10;
// a is still 5 — b got a real, independent copy

var list1 = new List<int> { 1, 2, 3 };
var list2 = list1;
list2.Add(4);
// list1 now has 4 items too — list2 is the same, real object as list1
```

`int`, `double`, `bool`, and `struct` types are **value types** — real,
independent copies. Every `class` (including `List<T>`, and any custom
type you write) is a **reference type** — real assignment shares the
identical, real underlying object, the same real behavior Python's
lists and dicts already have (Python has no real value types at all;
every Python object works like C#'s reference types). The real,
practical rule: numbers and booleans copy, everything else shares.

## Namespaces and `using`: real, direct parallel to `import`

```csharp
using System;
using System.Collections.Generic;

namespace MyAddIn
{
    public class ToolPanel { }
}
```

`using System.Collections.Generic;` is the real, direct equivalent of
Python's `from collections import ...` — it brings a real namespace's
types into scope so you can write `List<int>` instead of the real,
fully-qualified `System.Collections.Generic.List<int>`. `namespace
MyAddIn { }` is the real, matching other half — it declares which real
namespace *your own* code lives in, the same real role a Python
package's folder structure plays.

## Access modifiers: real, enforced visibility

```csharp
public class ToolPanel
{
    public string Name;      // real, visible to any other code
    private int _internalId; // real, visible only inside this class
}
```

Python has no real, enforced privacy — a leading underscore
(`_internal_id`) is only ever a real, honor-system convention. C#'s
`private` is real and enforced: code outside the class genuinely
cannot compile a reference to `_internalId` at all. `public` is the
real, explicit opposite — visible to any other, real code. Most of
what you'll read in a real, unfamiliar API is `public` by definition —
that's the real, whole reason it's usable from outside at all.

## `this`: the real, explicit `self`

```csharp
public class ToolPanel
{
    private string _name;

    public ToolPanel(string name)
    {
        this._name = name; // this. is often left off when there's no ambiguity
        _name = name;       // identical, real meaning
    }
}
```

`this` is the real, direct equivalent of Python's `self` — except C#
never requires it as an explicit method parameter (no `def
method(self, ...)`); it's real and implicit unless you need it to
resolve a real naming collision, as above, between a parameter and a
field sharing one name.

## Constructors: real `ClassName(...)`, not `__init__`

```csharp
public class ToolPanel
{
    public string Name;

    public ToolPanel(string name)
    {
        Name = name;
    }
}
```

```python
class ToolPanel:
    def __init__(self, name):
        self.Name = name
```

A real C# constructor is a real method sharing its class's own exact
name, with no return type — the direct, real equivalent of Python's
`__init__`, called the identical, real way you'd expect:
`new ToolPanel("Bracket")`.

## Definition of done

- [ ] You can explain, in your own words, why `var x = 5; x =
      "hello";` fails to compile.
- [ ] You can state, in your own words, the real difference between a
      value type and a reference type, with one real example of each.
- [ ] You can read a real `using` statement and a real `namespace`
      declaration and explain what each one does.
- [ ] You wrote a real class with a real constructor and at least one
      `private` field.

## Next

[Lesson 12 — Enums: The Real Fix for Numeric-Code Lookups](lesson-12-enums-the-real-fix-for-numeric-code-lookups.md)
takes on one of your own, real, stated problems directly: replacing a
hand-maintained Python `dict` of numeric codes to string labels with a
real, built-in C# type made for exactly this.
