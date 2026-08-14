# Lesson 02: Properties as a Real Language Feature

**What you will build:** a throwaway `Thermostat` class, proving that
C#'s property syntax is not just a getter/setter naming convention — it's
a real language feature the compiler treats specially, with a call shape
that never has to change even when the logic behind it does.

**What you need to know first:** [Lesson 01](lesson-01-namespaces-and-using.md).
Java/Kotlin's getter/setter convention (or Kotlin's own `val`/`var`) is
the exact thing this lesson contrasts against.

**Terms introduced in this lesson:**
- **Property** — a C# member that looks like a field from the outside
  (`obj.Name`, no parentheses) but is backed by real `get`/`set`
  accessor methods the compiler generates or you write by hand.
- **Auto-implemented property** — a property with no custom logic; the
  compiler silently generates a hidden backing field and trivial
  accessors for you.
- **Backing field** — the real private field that actually stores a
  property's value, hidden when auto-implemented, written by hand in a
  full property.
- **Expression-bodied member** — the `=>` shorthand for a member whose
  body is a single expression, already seen once in Lesson 01 for a
  method; this lesson shows it applied to a property accessor.

**Objects and methods used:** none beyond `System.Console.WriteLine`,
already covered in Lesson 01.

---

## Concept Unit: Auto-Implemented Properties

### The Problem

Java exposes a field's value to outside code through explicit
`getName()`/`setName(String)` methods — real methods, with real
parentheses at every call site. Kotlin's `val`/`var` looks like a plain
field but is secretly backed by generated accessors too. C# needs
something a Java or Kotlin developer can read correctly on sight, but the
exact syntax — and what the compiler actually does with it — has to be
proven, not assumed to be "the same thing, different keyword."

### Introduce the Concept in Isolation

```csharp
public class Thermostat
{
    public double TargetTemperature { get; set; }
}

public class Program
{
    public static void Main()
    {
        var t = new Thermostat();
        t.TargetTemperature = 68.5;
        System.Console.WriteLine(t.TargetTemperature);
    }
}
```

Output:
```
68.5
```

`t.TargetTemperature = 68.5;` and `t.TargetTemperature` — both plain
field-shaped syntax, no parentheses anywhere, and yet `TargetTemperature`
was declared with `{ get; set; }`, not as a bare field. This is called an
**auto-implemented property**: the compiler, seeing `{ get; set; }` with
no body, silently generates a private backing field and two trivial
accessor methods behind the scenes — the assignment above is really
calling a generated `set` method, and the read is really calling a
generated `get` method, even though the *syntax* at the call site is
indistinguishable from touching a plain field directly.

### Discard

This exact `Thermostat` is deleted now — a slightly different version,
built for real logic instead of a trivial pass-through, replaces it in
the next Concept Unit below.

### Mechanical Walkthrough

- `public double TargetTemperature { get; set; }` — **(a) first
  appearance.** `double` — **(c) already basic**, an ordinary numeric
  type (real OOP/basic types, assumed known). `{ get; set; }` — the
  actual new syntax: no method body, no backing field written anywhere
  by hand — this line alone is a complete, working property declaration.
- `t.TargetTemperature = 68.5;` — **(a) first appearance** of what this
  syntax *is*: field-shaped access syntax that's secretly a method call
  to the compiler-generated `set` accessor.
- `System.Console.WriteLine(t.TargetTemperature);` — **(c) already
  basic**, `Console.WriteLine` from Lesson 01; `t.TargetTemperature`
  here is the matching read, secretly the generated `get` accessor.

### CS Lens

Not a hard CS concept in the design-pattern sense — this is a language
feature providing **uniform access**: whether a member is a plain stored
value or computed/validated logic, the caller's syntax (`obj.Member`)
never has to change to tell the difference. This exact idea, under the
name **the Uniform Access Principle**, is a real, named software design
principle (Bertrand Meyer, in the context of Eiffel, a language that
influenced this exact feature) — worth naming because it's the whole
reason this syntax exists rather than being cosmetic sugar.

## Concept Unit: A Full Property — Real Logic Behind the Same Syntax

### The Problem

An auto-implemented property is a trivial pass-through. The moment a
property needs real logic — rejecting an invalid value, for instance —
something has to hold the actual value somewhere the logic can check
before storing it. Does switching to real logic force every caller of
`t.TargetTemperature = ...` to change how they call it?

### Introduce the Concept in Isolation

```csharp
public class Thermostat
{
    private double _targetTemperature;

    public double TargetTemperature
    {
        get => _targetTemperature;
        set
        {
            if (value < 50 || value > 90)
                throw new System.ArgumentOutOfRangeException(
                    nameof(value), "Target must be between 50 and 90.");
            _targetTemperature = value;
        }
    }
}

public class Program
{
    public static void Main()
    {
        var t = new Thermostat();
        t.TargetTemperature = 68.5;
        System.Console.WriteLine(t.TargetTemperature);

        try
        {
            t.TargetTemperature = 200;
        }
        catch (System.ArgumentOutOfRangeException ex)
        {
            System.Console.WriteLine($"Rejected: {ex.Message}");
        }
    }
}
```

Output:
```
68.5
Rejected: Target must be between 50 and 90. (Parameter 'value')
```

The call site — `t.TargetTemperature = 68.5;`,
`t.TargetTemperature = 200;` — is **character-for-character identical**
to the trivial auto-property version above. Nothing about how `Program`
uses `Thermostat` changed at all; only what happens *inside*
`Thermostat` changed. This proves the CS Lens claim from the previous
unit directly: switching from a trivial pass-through to real validation
logic required zero changes anywhere outside the class.

### Discard

This `Thermostat` is also disposable — it exists only to prove the
call-site-stays-identical claim. Nothing from it appears in any later
lesson.

### Mechanical Walkthrough

- `private double _targetTemperature;` — **(a) first appearance** of the
  concept: a **backing field** — the real, private storage a full
  property manages by hand, following the `_camelCase` naming
  convention this codebase's own Android lessons already use for backing
  fields in Java/Kotlin (same convention, reused here, not new).
- `get => _targetTemperature;` — **(a) first appearance**, combining two
  things: `get` as a real accessor with a body (rather than the bodiless
  `get;` from the previous unit), and `=>` — **(b) hard concept
  reappearing** — the same expression-bodied shorthand from Lesson 01's
  `Describe()` method, here shortening `get { return
  _targetTemperature; }` to one line.
- `set { ... }` — **(a) first appearance** of a full `set` block (not the
  bodiless `set;` from the previous unit) — a real method body, run every
  time this property is assigned.
- `if (value < 50 || value > 90)` — **(a) first appearance** of `value`
  specifically: a compiler-provided identifier available only inside a
  `set` accessor, automatically bound to whatever was just assigned
  (`t.TargetTemperature = 200;` makes `value` equal `200` inside this
  block). `<`, `>`, `||` — **(c) already basic**, ordinary comparison and
  logical-or operators, ordinary syntax already known.
- `throw new System.ArgumentOutOfRangeException(nameof(value), "...")` —
  **(c) already basic** as a concept (throwing an exception, already
  known from Java/Kotlin's own `throw`); **(a) first appearance** of
  `nameof(value)` specifically: a compiler operator that turns an
  identifier into the literal string `"value"` at compile time, checked
  against real code — renaming the parameter later and forgetting to
  update a plain string literal is impossible with `nameof`, since a typo
  would be a compile error instead of a silently wrong string.
- `_targetTemperature = value;` — **(c) already basic**, an ordinary
  field assignment.
- `try { ... } catch (System.ArgumentOutOfRangeException ex) { ... }` —
  **(c) already basic**, ordinary try/catch, same shape as Java/Kotlin's
  own.
- `$"Rejected: {ex.Message}"` — flagged, not yet explained: string
  interpolation, given full first-appearance treatment next lesson
  ([Lesson 03](lesson-03-var-interpolation-nullable.md)) rather than
  here, to keep this unit's new-concept count to exactly one.

### SE Lens

The real alternative — Java's explicit `getTargetTemperature()`/
`setTargetTemperature(double)` methods — achieves the identical
validation behavior, at a real cost: every *existing* caller written
against a plain public field has to be rewritten the moment validation
is added later, because the call syntax itself changes from `obj.field =
x` to `obj.setField(x)`. C#'s property syntax pays a small, one-time cost
(slightly more ceremony than a bare field even in the trivial case) to
buy permanent freedom to add real logic later without ever touching a
call site — the exact tradeoff the Uniform Access Principle names.

## Connect the pieces

One trace: `{ get; set; }` with no body is a real, complete property —
the compiler fills in a hidden backing field and trivial accessors.
Writing the backing field and accessor bodies out by hand, with real
validation logic inside `set`, changes *only* what happens inside
`Thermostat`; every line in `Program` that reads or writes
`t.TargetTemperature` stays exactly as written, because the call syntax
was never tied to whether the property is trivial or complex in the
first place.

## What breaks without this

Comment out the `if (value < 50 || value > 90) throw ...;` validation
block entirely, leaving only `_targetTemperature = value;` in `set`, and
run `t.TargetTemperature = 200;` again. It compiles and runs with no
error at all — `200` is silently accepted and stored, proving the
validation was doing real, load-bearing work: nothing about the property
*syntax* itself enforces the 50–90 range; only the logic explicitly
written inside `set` did, and removing it removes the guarantee
completely, silently, with no compiler warning.

## Exercises

1. Add a second full property, `CurrentTemperature`, with a `set` that's
   `private` (write `private set;` instead of `set;`) while `get` stays
   `public`. Confirm from a separate class that reading
   `t.CurrentTemperature` compiles, but assigning to it from outside
   `Thermostat` does not — and read the real compiler error you get.
2. Change the auto-implemented property from the first unit
   (`{ get; set; }`) to include only `{ get; }` with no `set` at all, and
   assign the value once, inside the constructor. Confirm a truly
   read-only-after-construction property compiles and behaves as
   expected from outside the class.

## Definition of Done

- [ ] You compiled and ran both `Thermostat` versions and saw their real
      output.
- [ ] You caused the real "no validation" failure above by removing the
      `if` check and confirmed `200` was silently accepted.
- [ ] You can state, in your own words, what a backing field is and why
      an auto-implemented property doesn't require you to write one by
      hand.
- [ ] You completed both exercises and observed the described behavior
      yourself.

## Next

[Lesson 03 — `var`, String Interpolation, and Nullable Reference
Types](lesson-03-var-interpolation-nullable.md) covers the `$"..."`
syntax flagged above, plus two more everyday pieces of C# syntax this
lesson's code already used without full explanation.
