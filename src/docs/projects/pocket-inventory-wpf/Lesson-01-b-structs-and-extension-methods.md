# Lesson 01b: A Copy That's Really a Copy

*(Prepended before Lesson 2, directly after Lesson 1a — see
`CURRICULUM_NOTES.md`'s 2026-07-31 audit. `SortDescription` (Lesson 18)
is a real, .NET-provided `struct`, used without ever explaining what
makes a `struct` different from every `class` this project has written
so far. This lesson covers that difference, plus a second, unrelated,
distinctly-C# feature: extension methods.)*

**Developer Story**
> As a developer who has only ever written `class`, I want to
> understand the one real difference a `struct` has from a class —
> proven directly, not just described — and a way to add a method to a
> type I don't own the source code for.

**What you will build**
Nothing that survives — every example here is a throwaway lab, same as
Lessons 0a/0b/0c/1a. What you'll walk away with: a real, tested answer
to "what actually changes when I write `struct` instead of `class`,"
and a real, working extension method.

**What you need to know first**
Lesson 0a: class, object, field, constructor. Lesson 1a:
`Dictionary<TKey, TValue>`, generic type parameters (briefly named
there; picked up again in more depth in a later lesson).

**Terms introduced in this lesson:**
- **Value type (`struct`)** — assigning or passing a `struct` copies its
  entire contents; the copy and the original are two fully independent
  values from that point on.
- **Reference type (`class`)** — assigning or passing a `class` instance
  copies only a reference to the *same* underlying object; both
  variables point at the one real thing.
- **Extension method** — a `static` method, declared in a `static`
  class, whose first parameter is marked `this` — callable as if it
  were a real instance method on the type named by that parameter, even
  for types you don't own or can't inherit from.

---

## Concept Unit: `struct` vs. `class` — Copied vs. Shared

### The Problem

Every class this project has written so far (`InventoryItem`, and every
throwaway `Lightbulb`) behaves one specific way when assigned to a
second variable: both variables end up pointing at the same real
object. Worth checking directly whether that's a universal rule, or
something specific to `class`.

### Introduce the Concept in Isolation
```bash
dotnet new console -o StructLab
```

Replace `Program.cs`:

```csharp
PointStruct originalStruct = new PointStruct { X = 1, Y = 1 };
PointStruct copiedStruct = originalStruct;
copiedStruct.X = 99;

Console.WriteLine($"struct original.X: {originalStruct.X}");
Console.WriteLine($"struct copied.X: {copiedStruct.X}");

PointClass originalClass = new PointClass { X = 1, Y = 1 };
PointClass copiedClass = originalClass;
copiedClass.X = 99;

Console.WriteLine($"class original.X: {originalClass.X}");
Console.WriteLine($"class copied.X: {copiedClass.X}");

struct PointStruct
{
    public int X;
    public int Y;
}

class PointClass
{
    public int X;
    public int Y;
}
```

Run it:

```bash
dotnet run
```

Real output:

```text
struct original.X: 1
struct copied.X: 99
class original.X: 99
class copied.X: 99
```

#### Execution Trace

1. `PointStruct copiedStruct = originalStruct;` copies `PointStruct`'s
   entire contents (`X` and `Y`) into a brand-new, independent value.
2. `copiedStruct.X = 99;` changes only that independent copy.
3. `originalStruct.X` still reads `1` — completely unaffected.
4. `PointClass copiedClass = originalClass;` copies only a *reference*
   — both `originalClass` and `copiedClass` now point at the exact same
   real `PointClass` object in memory.
5. `copiedClass.X = 99;` changes that one shared object.
6. `originalClass.X` now also reads `99` — there was never a second,
   independent object to begin with, only a second name for the same
   one.

*What this proves:* `struct` is called a **value type** — assignment
copies the entire value, producing two genuinely independent things.
`class` is called a **reference type** — assignment copies only a
reference, producing two names for the one real object. This is the
single, real, mechanical difference; everything else about `struct` vs.
`class` follows from it.

### Discard the Throwaway Example
Delete the `StructLab` folder. The value-type/reference-type
distinction is not discarded — `SortDescription` (Lesson 18), a real
.NET `struct`, behaves exactly this way.

### Mechanical Walkthrough

- `struct PointStruct { public int X; public int Y; }` — **first
  appearance of `struct`.** Declared exactly like a `class`, field for
  field — the keyword itself is the only source difference; the
  behavioral difference is entirely in how assignment works.
- `PointStruct copiedStruct = originalStruct;` — an ordinary-looking
  assignment that behaves completely differently depending on whether
  the type on the left is a `struct` or a `class` — nothing about the
  syntax itself signals which behavior applies.
- `class PointClass { public int X; public int Y; }` — identical shape
  to every class this project has already written (`InventoryItem`),
  included here only for direct, side-by-side contrast.

### CS Lens

Every `class` this project has ever defined — `InventoryItem`, every
ViewModel — is a **reference type**, and the shared-object behavior
this unit's `PointClass` proof demonstrated is exactly why passing an
`InventoryItem` into a method and mutating a field there is visible to
every other piece of code holding that same item (the deep-copy-vs-
reference-copy distinction Lesson 27 already explored practically, now
given its real, underlying mechanical cause). `struct` exists as an
alternative specifically for small, simple values where independent
copies are the *desired* behavior — a coordinate, a date, a color —
not general-purpose domain objects.

### SE Lens

Why doesn't `InventoryItem` itself become a `struct`, given value-type
copying sounds simpler to reason about? Because `InventoryItem` is
exactly the kind of thing value-type copying would break: `Items`
(`ObservableCollection<InventoryItem>`), `DetailPanel.DataContext`, and
`SelectedItem` all need to refer to the *same* real item so that editing
it in one place is visible everywhere else — the entire MVVM binding
system (Lesson 7 onward) depends on `InventoryItem` being a reference
type. `struct` is the right choice only when independent copies are
actually wanted; for anything with real, ongoing identity — anything a
user selects, edits, or tracks over time — `class` is correct.

### Connection

The next unit turns to a completely unrelated C# feature — adding a
method to a type without being able to modify or inherit from it at
all.

---

## Concept Unit: Extension Methods — Adding a Method You Don't Own

### The Problem

`string` (used constantly already — every `InventoryItem.Name`,
`Category`, `Location`) has no built-in `IsBlank()` method. `string` is
also **sealed** — worth confirming directly what that means for the
obvious first idea: writing a derived class that adds one.

### Introduce the Concept in Isolation
```bash
dotnet new console -o ExtensionLab
```

Replace `Program.cs`:

```csharp
class BlankableString : string
{
}
```

Run it:

```bash
dotnet run
```

Real, captured failure:

```text
error CS0509: 'BlankableString': cannot derive from sealed type 'string'
```

*What this proves:* `string` is marked `sealed` — no class may ever
inherit from it, for any reason, confirmed directly by the compiler
refusing even this simplest possible attempt. Adding a real
`IsBlank()` *method* to `string` itself is not an option — inheritance,
Lesson 0a's own tool for adding behavior, is closed off here entirely.

Now the real fix:

```csharp
string name = "   ";
string other = "Hammer";

Console.WriteLine($"'{name}'.IsBlank(): {name.IsBlank()}");
Console.WriteLine($"'{other}'.IsBlank(): {other.IsBlank()}");

static class StringExtensions
{
    public static bool IsBlank(this string value)
    {
        return string.IsNullOrWhiteSpace(value);
    }
}
```

Real output:

```text
'   '.IsBlank(): True
'Hammer'.IsBlank(): False
```

#### Execution Trace

1. `name.IsBlank()` — called with ordinary dot syntax, exactly like a
   real instance method, on a plain `string`.
2. C# resolves `IsBlank` to `StringExtensions.IsBlank(this string value)`,
   passing `name` itself as `value` — `string.IsNullOrWhiteSpace("   ")`
   returns `true`.
3. `other.IsBlank()` — the same resolution, `value` is `"Hammer"` this
   time — `string.IsNullOrWhiteSpace("Hammer")` returns `false`.

*What this proves:* `IsBlank`, declared as a `static` method taking a
`this string value` first parameter, becomes callable as
`anyString.IsBlank()` — real, working syntax that looks exactly like a
genuine instance method, on a type (`string`) that flatly refuses
inheritance. This is called an **extension method**.

### Discard the Throwaway Example
Delete the `ExtensionLab` folder.

### Mechanical Walkthrough

- Attempting `: string` on a class declaration — **first appearance of a
  real `sealed` restriction being hit directly**, proven by the real
  `CS0509` error — `string` explicitly forbids exactly what Lesson 0a's
  inheritance would otherwise allow.
- `static class StringExtensions` — an extension method must live
  inside a `static` class — **first appearance of a `static` class**
  (distinct from Lesson 1a's `static` *field*; here the entire class,
  never instantiated, only ever a container for `static` methods).
- `public static bool IsBlank(this string value)` — **first appearance
  of the `this` parameter modifier.** The `this` here is not the
  familiar "the current object" keyword — on a method's *first
  parameter specifically*, it means "make this method callable as if it
  belonged to whatever type follows."
- `name.IsBlank()` — ordinary method-call syntax, resolving to a
  `static` method the compiler rewrites, behind the scenes, into
  `StringExtensions.IsBlank(name)`.

### CS Lens

An extension method never actually becomes part of the type it extends
— `string` itself is completely unchanged; `IsBlank` doesn't exist
inside `string`'s own real definition, only inside `StringExtensions`,
made *visible* as if it did through nothing more than the `this`
parameter and C#'s own call-syntax rewriting. This is why extension
methods can never access `string`'s private internals the way a real
instance method could — they only ever see what's already public.

### SE Lens

Why not just write `IsBlank(name)` as an ordinary `static` method,
skipping the `this` parameter entirely? Both work identically at
runtime — the difference is purely about how the call reads at the
point of use. `name.IsBlank()` reads as "a property of this string,"
placing the check right where the string itself already is in the
code, the same left-to-right flow `name.Length` or `name.ToUpper()`
already have; `IsBlank(name)` reads as "some external operation applied
to a string," burying the actual subject inside a parameter list. For a
check used constantly — validating `InventoryItem.Name` is never blank,
for instance — the instance-method-shaped call reads closer to how a
person would actually describe the check out loud.

### Connection

Neither `struct` nor extension methods appear again by name in this
project's own real code — `InventoryItem` is correctly a `class`
(previous unit's SE Lens), and this project's own validation (Lesson
11's `IDataErrorInfo`) uses plain method calls rather than extension
methods. Both are real, standard C# tools worth recognizing on sight —
`SortDescription` (Lesson 18) is a `struct`, and `Enumerable.Where`
itself, part of LINQ, is an extension method on `IEnumerable<T>` — even
though this specific project never authors either one directly.

---

## Closing

### Connect the Pieces

`PointStruct` and `PointClass` (first unit) proved, with real,
contrasting output, that `struct` copies its entire value on assignment
while `class` copies only a shared reference — the real, mechanical
reason `InventoryItem` must stay a `class` for this project's binding
system to work at all. `StringExtensions.IsBlank` (second unit) proved
a `static` method with a `this`-marked first parameter becomes callable
with ordinary dot syntax on a type — even `string`, real, proven
`sealed` against inheritance by the `CS0509` error — without ever
modifying that type's own source.

### What Breaks Without This

Already demonstrated twice, on purpose, in this lesson: assigning a
`class` instance and mutating the "copy" silently changes the original
too (the `PointClass` proof) — a real, silent bug shape if you expect
`struct`-style independence and get `class`-style sharing instead — and
attempting to inherit from `string` fails immediately and clearly (the
real `CS0509` error). No further break-it exercise needed this lesson.

### Exercises

- In a fresh `StructLab`, write a method `void TryModify(PointStruct p)
  { p.X = 999; }`, call it with a real `PointStruct`, and confirm, with
  real output, that the original is unaffected — value-type copying
  applies to method parameters exactly the same way it applies to plain
  assignment.
- In a fresh `ExtensionLab`, write a second extension method,
  `IsAllUppercase(this string value)`, using `string.Equals(value,
  value.ToUpper())`. Confirm real output for both a mixed-case and an
  all-uppercase string.
- Predict, in your own words, what `int` — a real, built-in C# type —
  actually is: `struct` or `class`? Write a quick throwaway check
  (assign one `int` to another, mutate the second, check the first) to
  confirm your prediction with real output before looking it up.

### Definition of Done

- [ ] You ran the `struct`-vs-`class` lab yourself and got the real,
      contrasting output — not just read it here.
- [ ] You reproduced the real `CS0509` error attempting to inherit from
      `string`, and then ran the working `IsBlank()` extension method
      for real.
- [ ] You can explain, in your own words and without re-reading this
      lesson, why `InventoryItem` needs to stay a `class` rather than a
      `struct`.
- [ ] You completed the `int` value-type exercise and confirmed your
      prediction with real output.
