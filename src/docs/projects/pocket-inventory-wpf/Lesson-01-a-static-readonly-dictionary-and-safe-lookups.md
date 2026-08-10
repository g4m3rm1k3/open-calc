# Lesson 01a: Not Every Field Belongs to One Object

*(Prepended before Lesson 2 — see `CURRICULUM_NOTES.md`'s 2026-07-29
revision. Lesson 2's own attached-property lab uses `static`,
`readonly`, `Dictionary<TKey, TValue>`, target-typed `new()`, and a
`TryGetValue`/ternary pattern together in one block, with no individual
treatment of any of them — this lesson gives each one its own real,
isolated proof first.)*

**Developer Story**
> As a developer who just learned that every object gets its own copy
> of every field, I want to understand the one real exception to that
> rule, a field that can be locked after construction, and a
> collection type that looks up values by key instead of by position —
> before I see all of them combined in one dense line of real code.

**What you will build**
Nothing that survives — every example here is a throwaway lab. What you
walk away with: real, tested answers to five specific questions Lesson
2 will otherwise leave you guessing about.

**What you need to know first**
Lesson 00a (class, object, field, constructor, inheritance). Basic
Python: functions, data types, loops, `list`, `dict` — the `dict`
knowledge specifically gets reused directly in this lesson's third
Concept Unit. Nothing about C# beyond Lesson 00a.

**Terms introduced in this lesson:**
- **`static`** — a field or method marked `static` belongs to the
  *class itself*, not to any one object built from it; there is exactly
  one copy, shared by every object, for the lifetime of the program.
- **`readonly`** — a field that can only be assigned inside its own
  declaration or inside a constructor of the same class; any assignment
  anywhere else is a compile error.
- **`Dictionary<TKey, TValue>`** — C#'s key-value lookup collection,
  the direct cousin of Python's `dict`; `TKey`/`TValue` are **generic
  type parameters** — placeholders naming what type of key and what
  type of value this specific dictionary holds.
- **Indexer (`dict[key]`)** — reading or writing a dictionary by key
  using square-bracket syntax; reading a key that doesn't exist throws a
  real exception (`KeyNotFoundException`), unlike Python's own `dict`
  indexing behavior of raising `KeyError` — same idea, different
  exception type.
- **Target-typed `new()`** — `new()` with no type name after it, legal
  only when the compiler can already tell what type is being built from
  context (here, the variable's own declared type on the left).
- **`out` parameter** — a method parameter that lets the *called*
  method hand a second value back to the caller, in addition to its
  normal return value.
- **`TryGetValue`** — `Dictionary`'s safe lookup method: returns `true`/
  `false` for whether the key existed, and hands back the value through
  an `out` parameter — never throws, unlike the indexer.

**Objects and methods used**
- `Console.WriteLine` and the ternary conditional operator both reappear
  from Lesson 00a, which already gave each full treatment — brief
  reminder only, per the Repetition Rule. `Dictionary<TKey, TValue>` and
  its members are this lesson's own subject, given full treatment in
  Concept Units 3 and 4 above, not deferred to this section.

---

## Concept Unit: `static` — Belonging to the Class, Not the Object

### The Problem

Lesson 00a proved every object gets its own independent copy of every
field. Sometimes the opposite is genuinely needed — one single piece of
data shared by *every* object of a class, with no independent copies at
all.

### Introduce the Concept in Isolation

```
dotnet new console -o StaticLab
cd StaticLab
```

Replace `Program.cs`:

```csharp
Lightbulb a = new Lightbulb();
Lightbulb b = new Lightbulb();
Lightbulb c = new Lightbulb();

Console.WriteLine($"a.SerialNumber = {a.SerialNumber}");
Console.WriteLine($"b.SerialNumber = {b.SerialNumber}");
Console.WriteLine($"c.SerialNumber = {c.SerialNumber}");
Console.WriteLine($"Lightbulb.TotalBuilt = {Lightbulb.TotalBuilt}");

class Lightbulb
{
    public static int TotalBuilt = 0;
    public int SerialNumber;

    public Lightbulb()
    {
        TotalBuilt = TotalBuilt + 1;
        SerialNumber = TotalBuilt;
    }
}
```

Real output:

```
a.SerialNumber = 1
b.SerialNumber = 2
c.SerialNumber = 3
Lightbulb.TotalBuilt = 3
```

*What this proves:* `SerialNumber` behaves exactly as Lesson 00a
predicted — each object holds its own, `1`/`2`/`3`. `TotalBuilt` behaves
completely differently: it isn't accessed as `a.TotalBuilt` at all —
`Lightbulb.TotalBuilt`, accessed on the *class itself*, correctly shows
`3` — proof there is exactly one `TotalBuilt`, incremented by all three
constructor calls in turn, not three separate copies.

#### Execution Trace

1. `Lightbulb a = new Lightbulb();` — the constructor runs:
   `TotalBuilt` goes from its starting value `0` to `1`, because this is
   the *first* constructor call in the whole program; `a.SerialNumber`
   is then set to that same `1`.
2. `Lightbulb b = new Lightbulb();` — a *different* object is built, but
   the constructor reads and writes the *same* `TotalBuilt` field —
   `TotalBuilt` goes `1 → 2`, because step 1 already left it at `1`, not
   because `b` somehow inherited a fresh counter; `b.SerialNumber` is
   set to `2`.
3. `Lightbulb c = new Lightbulb();` — same mechanism again, `TotalBuilt`
   goes `2 → 3`; `c.SerialNumber` is set to `3`.
4. `Lightbulb.TotalBuilt` (final read) — shows `3`, the cumulative
   result of all three constructor calls sharing one field — this is
   the value a *fourth* `new Lightbulb()` would see as its own starting
   point, proving the field truly persists across every construction,
   not reset per object the way `SerialNumber` is.

### Discard the Throwaway Example

Delete `StaticLab`. This exact `Lightbulb` will not appear again.

### Mechanical Walkthrough

- `public static int TotalBuilt = 0;` — (first appearance) the
  `static` keyword: this field belongs to `Lightbulb` the class, not to
  any individual `Lightbulb` object. There is exactly one `TotalBuilt`
  in the entire running program, no matter how many `Lightbulb`s exist.
- `TotalBuilt = TotalBuilt + 1;` (inside the constructor) — every
  constructor call reads and writes the *same* shared value — this is
  *why* it reaches `3` after three constructions, not `1` three times.
- `SerialNumber = TotalBuilt;` — copies the shared counter's *current*
  value into this one object's own instance field at the moment of
  construction — after this line runs, `SerialNumber` is an independent
  snapshot, no longer connected to future changes in `TotalBuilt`.
- `Lightbulb.TotalBuilt` — (first appearance) accessing a `static`
  member through the class name, never through an object — `a.TotalBuilt`
  would not compile.

### CS Lens

This is **class-level (shared) state** versus **instance-level (per-
object) state** — the same distinction exists in nearly every
class-based language; `static` in C# and Python's own class-attribute-
versus-instance-attribute split are the same idea, different syntax.

Also recognized in: a running total of every object of some type ever
created, a shared configuration value every instance should see
identically, a cache shared across every user of a class rather than
duplicated per user.

### SE Lens

The alternative — a global variable outside any class — would work
mechanically the same way, but loses the connection to `Lightbulb`
specifically: nothing about the name or location signals "this is
`Lightbulb`'s own shared counter." `static` keeps shared state
logically scoped to the class it's actually about, discoverable by
reading that class alone.

### Connection

Lesson 2's real code uses a `static` field to hold one shared lookup
table for an entire feature — not per-object state, exactly this
mechanism.

---

## Concept Unit: `readonly` — Assignable Once, Then Locked

### The Problem

Some fields should never change after an object is built — a serial
number, an ID, a value the rest of the class's own correctness depends
on staying fixed. Nothing about a plain field stops it from being
reassigned later, accidentally or otherwise.

### Introduce the Concept in Isolation

```
dotnet new console -o ReadonlyLab
cd ReadonlyLab
```

```csharp
Widget w = new Widget("ABC-1");
Console.WriteLine(w.SerialTag);
w.SerialTag = "ZZZ-9";

class Widget
{
    public readonly string SerialTag;

    public Widget(string tag)
    {
        SerialTag = tag;
    }
}
```

Real, captured failure:

```
error CS0191: A readonly field cannot be assigned to (except in a
constructor or init-only setter of the type in which the field is
defined or a variable initializer)
```

Removing the illegal line after construction:

```csharp
Widget w = new Widget("ABC-1");
Console.WriteLine(w.SerialTag);
```

Real output:

```
ABC-1
```

*What this proves:* assigning `SerialTag` **inside** the constructor
(`SerialTag = tag;`) compiles and works fine — that's the one place
`readonly` allows an assignment. Assigning it from anywhere else,
including the exact same field on the exact same object from outside
the class, is a real compile-time error, not a runtime one — caught
before the program ever runs at all.

### Discard the Throwaway Example

Delete `ReadonlyLab`.

### Mechanical Walkthrough

- `public readonly string SerialTag;` — (first appearance) `readonly`:
  this field may be assigned only inside its own declaration or inside
  a constructor of `Widget` — never anywhere else, ever, enforced by
  the compiler.
- `SerialTag = tag;` (inside the constructor) — legal, because this is
  exactly the one place `readonly` permits an assignment.
- `w.SerialTag = "ZZZ-9";` (outside the class, after construction) —
  illegal, proven by the real `CS0191` error — `readonly` doesn't care
  that this is "the same field on the same object"; the rule is about
  *where* the assignment happens, not *what value* it sets.

### CS Lens

This is **immutability enforced by the compiler** rather than by
convention or documentation — the same broader idea Python's own
`@dataclass(frozen=True)` reaches for, or a naming convention like
`_CONSTANT_NAME`, except here the guarantee is real and checked, not
just implied by a name.

Also recognized in: constants, configuration values fixed once at
startup, any field representing something in the real world that
genuinely cannot change after an object is created (a birthdate, a
manufacture serial number).

### SE Lens

The alternative — an ordinary mutable field, trusted by convention
never to be reassigned — relies on every future reader of every future
line of code remembering that convention correctly, forever.
`readonly` converts "please don't change this" into "the compiler
won't let you," at zero runtime cost — the check happens once, at
compile time.

### Connection

Lesson 2's own lab field is declared `private static readonly` — both
this unit's `readonly` and the previous unit's `static`, combined on
one field, meaning exactly one shared value that's set once and never
reassigned.

---

## Concept Unit: `Dictionary<TKey, TValue>` — C#'s Version of Python's `dict`

### The Problem

A `list`/`List<T>` looks things up by position (index `0`, `1`, `2`...).
Real data is often more naturally looked up by a *name* or *key*
instead — exactly what Python's own `dict` already does, and what a
program needs here too.

### Introduce the Concept in Isolation

```
dotnet new console -o DictLab
cd DictLab
```

```csharp
Dictionary<string, int> prices = new Dictionary<string, int>();
prices["Widget"] = 5;
prices["Gadget"] = 12;

Console.WriteLine(prices["Widget"]);
Console.WriteLine(prices.ContainsKey("Gizmo"));
```

Real output:

```
5
False
```

Reading a key that was never set:

```csharp
Console.WriteLine(prices["Gizmo"]);
```

Real, captured crash:

```
Unhandled exception. System.Collections.Generic.KeyNotFoundException:
The given key 'Gizmo' was not present in the dictionary.
```

*What this proves:* `Dictionary<string, int>` behaves exactly like
Python's `dict` for the operations you already know — square-bracket
set, square-bracket get, checking membership. The one real difference:
reading a missing key with `[...]` doesn't return `None`/raise
`KeyError` the way Python's own `dict[missing_key]` would — it throws a
`KeyNotFoundException`, a different exception type, same underlying
"this key genuinely isn't here" situation.

### Discard the Throwaway Example

Delete `DictLab`.

### Mechanical Walkthrough

- `Dictionary<string, int>` — (first appearance) a **generic type**:
  `Dictionary` alone isn't a complete, usable type — `<string, int>`
  fills in its two **generic type parameters**, `TKey` and `TValue`,
  saying "this specific dictionary maps `string` keys to `int` values."
  A `Dictionary<int, string>` would be a completely different,
  equally valid dictionary shape.
- `new Dictionary<string, int>()` — (reappearing, `new` from Lesson
  00a) builds a real, empty dictionary object.
- `prices["Widget"] = 5;` — (first appearance) the **indexer**:
  square-bracket syntax used to *write* — if `"Widget"` isn't a key
  yet, this adds it; if it already exists, this overwrites its value.
- `prices["Widget"]` (read context) — the same indexer syntax, now
  *reading* — returns the value stored under that key, or throws if the
  key was never set, proven above.
- `prices.ContainsKey("Gizmo")` — (first appearance) checks whether a
  key exists at all, returning `true`/`false`, without ever risking the
  exception a direct `[...]` read on a missing key would.

### CS Lens

A dictionary is a **hash table** — real-world data addressed by a
meaningful key instead of an arbitrary position, the same underlying
data structure across nearly every language, just named and typed
differently (`dict` in Python, `HashMap` in Java, `Dictionary` here).

Also recognized in: any lookup-by-name problem — a phone book, a cache
keyed by request URL, a symbol table in a compiler mapping variable
names to their declared types.

### SE Lens

The alternative — a `List<(string, int)>` of pairs, searched linearly
for a matching key every time — technically works but gets slower as
the list grows, checking every entry one by one. A real dictionary
looks a key up directly, without scanning past entries that don't
match, which is the entire reason it exists as its own data structure
rather than "just a list you search."

### Connection

Lesson 2's own lab keeps its lookup table as a `Dictionary<object,
int>` — same mechanism, generic parameters filled in with `object` and
`int` instead of `string` and `int`.

---

## Concept Unit: Target-Typed `new()` and Safe Lookups With `out`

### The Problem

Writing `Dictionary<string, int>` twice on one line — once for the
variable's declared type, once for `new Dictionary<string, int>()` —
is real, visible repetition. And the crash just proven above (reading a
missing key) needs a way to ask "is this here?" and "what is it?" in
one step, without risking that exception.

### Introduce the Concept in Isolation

```
dotnet new console -o SafeLookupLab
cd SafeLookupLab
```

```csharp
Dictionary<string, int> prices = new();
prices["Widget"] = 5;

int gizmoPrice = prices.TryGetValue("Gizmo", out int found) ? found : 0;
Console.WriteLine($"Gizmo price: {gizmoPrice}");

int widgetPrice = prices.TryGetValue("Widget", out int found2) ? found2 : 0;
Console.WriteLine($"Widget price: {widgetPrice}");
```

Real output:

```
Gizmo price: 0
Widget price: 5
```

*What this proves:* `new()` with no type name, on the right side of a
declaration whose left side already says `Dictionary<string, int>`,
builds the exact same real dictionary as spelling the full type out
twice — the compiler already knows what's being built from context.
`TryGetValue` never crashed on the missing `"Gizmo"` key — it returned
`false`, and the `? :` picked the fallback `0` — proof this is a
completely safe alternative to the indexer's own crash-on-missing-key
behavior proven in the previous unit.

### Discard the Throwaway Example

Delete `SafeLookupLab`.

### Mechanical Walkthrough

- `Dictionary<string, int> prices = new();` — (first appearance)
  **target-typed `new()`**: legal specifically because the variable's
  declared type (`Dictionary<string, int>`, on the left) already tells
  the compiler exactly what `new()` needs to build — pure shorthand,
  not a different mechanism.
- `prices.TryGetValue("Gizmo", out int found)` — (first appearance)
  `TryGetValue` takes the key to look up, plus a second parameter
  marked `out` — instead of *returning* the found value the normal way,
  it hands it back *through* that `out` parameter, while its real
  return value is a separate `bool`: `true` if the key existed,
  `false` if it didn't. `int found` inside the `out` position declares
  a brand-new variable right there, in the argument list itself.
- `... ? found : 0` — (reappearing, ternary — already established
  syntax) reads as: if `TryGetValue` returned `true`, use `found` (the
  value it just handed back); otherwise, fall back to `0` — `found`
  genuinely holds a real value either way (C# requires this), but only
  the `true` branch's value is meaningful here.
- `prices.TryGetValue("Widget", out int found2)` — same call shape,
  different variable name (`found2`, since `found` already exists from
  the earlier statement) — succeeds, `true`, `found2` is `5`.

### CS Lens

`TryGetValue`'s two-outputs-in-one-call shape (a `bool` success flag
*and* a real value, together) is the **Try-Parse pattern** — a
deliberate C# convention (`int.TryParse`, `Dictionary.TryGetValue`,
`Dictionary.TryAdd`, and others) that turns "this might not work" into
one call producing both "did it work" and "here's the result," instead
of "throws an exception, catch it" or "returns a special sentinel value
that might be confused with a real one."

Also recognized in: Python's own `dict.get(key, default)` — same
underlying use case (safe lookup with a fallback), a different-shaped
solution (Python returns the fallback directly instead of a
success/value pair).

### SE Lens

The alternative — always using the indexer and wrapping it in a
`try`/`catch` for the missing-key case — genuinely works, but exception
handling is comparatively expensive and reads as "this is expected to
fail sometimes," when a missing key is often a completely normal,
anticipated case, not an exceptional one. `TryGetValue` treats "not
found" as an ordinary `false`, not a thrown error.

### Connection

Lesson 2's own lab combines this exact `TryGetValue`/ternary shape with
a `static readonly Dictionary<object, int>` — every construct this
lesson isolated, together, in the real code you're about to read.

---

## Closing

### Connect the Pieces

One throughline: `static` (Unit 1) proved a field can belong to a class
instead of any one object; `readonly` (Unit 2) proved a field can be
locked to "assignable once, in the constructor, never again." Lesson
2's own lab combines both on one field: `private static readonly
Dictionary<object, int> rowsByChild`. `Dictionary<TKey, TValue>` (Unit
3) proved C#'s key-value lookup behaves like Python's `dict`, with one
real difference — a missing-key read throws instead of returning
`None`. Target-typed `new()` and `TryGetValue` (Unit 4) proved the
shorthand construction syntax and the safe-lookup pattern Lesson 2's
own code uses to avoid that exact crash. Every construct in that one
dense line has now been proven, individually, for real.

### What Breaks Without This

Already demonstrated twice, on purpose: a `readonly` field assigned
outside its constructor (`CS0191`), and a `Dictionary` indexer read on
a missing key (`KeyNotFoundException`). Both are real, compiler- or
runtime-enforced failures, not conventions.

### Exercises

- In `StaticLab`, add a second `static` field, `public static int
  LastSerialNumber = 0;`, updated the same way `TotalBuilt` is.
  Confirm both shared fields track correctly across the same three
  constructions.
- In `DictLab`, add a `Dictionary<int, string>` (keys and values
  swapped from the example) mapping ID numbers to names. Confirm the
  generic type parameters really do determine what's a valid key vs.
  value — try using a `string` as a key and read the real compiler
  error.
- In `SafeLookupLab`, replace the `? :` fallback with `prices.GetValueOrDefault("Gizmo", 0)` (a real, built-in `Dictionary` method) and confirm it produces the identical result to the `TryGetValue`/ternary version, with less code.

### Definition of Done

- [ ] You ran all four labs yourself and got the exact real output/errors
      shown above.
- [ ] You can explain, without re-reading this lesson, the difference
      between a `static` field and an instance field.
- [ ] You caused the real `CS0191` and `KeyNotFoundException` failures
      yourself.
- [ ] You completed the three Exercises above.
- [ ] You can point to the exact line in Lesson 2's lab that combines
      all five constructs this lesson isolated, and explain each piece
      of it without help.
