# Lesson 03: `var`, String Interpolation, and Nullable Reference Types

**What you will build:** three small, disposable proofs — that `var` is
real static typing, not Python-style dynamic typing; that `$"..."` is a
distinct syntax from plain string concatenation; and that `string?`
makes the compiler itself catch a null-reference mistake before the
program ever runs.

**What you need to know first:** [Lesson 02](lesson-02-properties.md).

**Terms introduced in this lesson:**
- **`var`** — a keyword telling the compiler to infer a variable's
  concrete type from its initializer, rather than the type being written
  explicitly; the variable is still fixed to that one real type forever.
- **String interpolation** — the `$"..."` syntax embedding expressions
  directly inside a string literal.
- **Format specifier** — a `:X` suffix inside an interpolated
  `{expression}`, controlling how a value is rendered as text.
- **Nullable reference type** — with `<Nullable>enable</Nullable>` set
  (the default in every current .NET project template), a reference type
  is non-nullable unless explicitly marked with a trailing `?`.

**Objects and methods used:** none beyond `System.Console.WriteLine`,
already covered.

---

## Concept Unit: `var` Is Static Typing, Inferred

### The Problem

`var name = "Drill";` looks, on first glance, exactly like Python's
untyped `name = "Drill"`. A reader coming from Python (or seeing Python
comparisons made elsewhere in this codebase's own material) could
reasonably assume `var` means "this variable can hold anything, checked
only at runtime." Whether that assumption is true has to be proven, not
guessed.

### Introduce the Concept in Isolation

```csharp
var name = "Drill";
System.Console.WriteLine(name);
name = 5;
```

This does **not** compile:

```
error CS0029: Cannot implicitly convert type 'int' to 'string'
```

`var name = "Drill";` infers `name`'s real, concrete type — `string` —
once, at compile time, from the right-hand side. After that line, `name`
is a `string` variable, permanently, exactly as if it had been written
`string name = "Drill";` by hand. The later assignment `name = 5;` fails
for the identical reason `string name = "Drill"; name = 5;` would fail —
`var` only saved typing the type name twice; it changed nothing about C#
being statically typed. This is called **type inference**, not dynamic
typing.

### Discard

This two-line proof is disposed of now — the real gotcha below uses a
fresh, equally small example.

### Mechanical Walkthrough

- `var name = "Drill";` — **(a) first appearance.** `var` infers `name`'s
  type from `"Drill"` (a `string` literal), making `name` a real,
  concrete `string` variable from this point on.
- `System.Console.WriteLine(name);` — **(c) already basic**, `WriteLine`
  from Lesson 01, `name` an ordinary variable read.
- `name = 5;` — **(c) already basic** as a plain assignment; the failure
  it causes is the actual point of this unit, explained above.

## Concept Unit: The One Real `var` Gotcha

### The Problem

A reader who has correctly internalized "`var` is just static typing
with less typing" might reasonably assume `var x = 1, y = 2;` behaves
exactly like `int x = 1, y = 2;` — two variables, declared together, on
one line. It doesn't, and the reason is worth proving directly rather
than memorizing as an arbitrary rule.

### Introduce the Concept in Isolation

```csharp
int a = 1, b = 2;
System.Console.WriteLine(a + b);
```

Output:
```
3
```

Now the `var` version, changing nothing but the keyword:

```csharp
var x = 1, y = 2;
```

This does **not** compile:

```
error CS0819: Implicitly-typed variables cannot have multiple declarators
```

`int a = 1, b = 2;` — a single statement declaring two `int` variables at
once, real and legal, proven by the `3` it correctly printed above. The
identical shape with `var` instead of `int` fails outright — `var`
specifically cannot declare more than one variable in a single statement,
even though the explicit-type form can. The reason lives in how `var`
resolves: the compiler has to infer *one* concrete type from the
right-hand side to replace `var` with, and `var x = 1, y = 2;` would
require inferring two independent types from a single `var` keyword —
C#'s grammar for `var` simply doesn't allow that ambiguity to exist,
full stop, regardless of whether the two initializers happen to share a
type.

### Discard

Both snippets above are disposable — they exist purely to isolate this
one syntax rule.

### Mechanical Walkthrough

- `int a = 1, b = 2;` — **(c) already basic**, ordinary multi-variable
  declaration syntax, same shape Java allows too.
- `System.Console.WriteLine(a + b);` — **(c) already basic**, `+` on two
  `int`s, ordinary arithmetic.
- `var x = 1, y = 2;` — **(a) first appearance** of the actual failure
  case, explained above; the fix, when two `var`-inferred variables are
  genuinely needed together, is simply two separate statements
  (`var x = 1; var y = 2;`), which compiles without issue.

## Concept Unit: String Interpolation

### The Problem

Building a message from a mix of literal text and variable values —
`"Rejected: " + ex.Message` — works, using plain string concatenation
(`+`), the same mechanism Java uses. C# has a second, more readable
syntax for the same job, already used without explanation in Lesson 02's
`$"Rejected: {ex.Message}"` — owed full treatment now.

### Introduce the Concept in Isolation

```csharp
string name = "Drill";
int qty = 3;

string concatenated = "Item: " + name + ", qty: " + qty;
string interpolated = $"Item: {name}, qty: {qty}";

System.Console.WriteLine(concatenated);
System.Console.WriteLine(interpolated);
```

Output:
```
Item: Drill, qty: 3
Item: Drill, qty: 3
```

Both lines produce identical output — proof that `$"..."` is genuinely
equivalent to the plain concatenation above, not a different result,
only different source syntax. This is called **string interpolation**:
the leading `$` before the opening quote turns on a mode where `{expr}`
inside the string is evaluated as a real C# expression and substituted
in, rather than being printed as four literal characters. Without the
leading `$`, `"{name}"` would print the literal text `{name}` — the `$`
is what activates the substitution at all.

### Discard

`concatenated`/`interpolated` are disposed of; a richer version, proving
format specifiers, replaces them next.

### Mechanical Walkthrough

- `string concatenated = "Item: " + name + ", qty: " + qty;` — **(c)
  already basic**, `+` used for both string concatenation and (via
  automatic conversion) appending a numeric value — the same operator
  overloading behavior Java's own `+` on strings has.
- `string interpolated = $"Item: {name}, qty: {qty}";` — **(a) first
  appearance.** The leading `$` and each `{expr}` substitution, explained
  above.

## Concept Unit: Format Specifiers Inside an Interpolation

### The Problem

A raw interpolated numeric value (`{price}`) prints with whatever default
formatting the type has — a `decimal` like `7.5` prints as `7.5`, not
`$7.50`. Displaying currency, percentages, or fixed decimal places needs
a way to control the rendering, not just insert the raw value.

### Introduce the Concept in Isolation

```csharp
decimal price = 7.5m;
System.Console.WriteLine($"Raw: {price}");
System.Console.WriteLine($"Currency: {price:C}");
System.Console.WriteLine($"Two places: {price:F2}");
```

Output:
```
Raw: 7.5
Currency: $7.50
Two places: 7.50
```

`{price:C}` — a colon inside the braces, followed by a letter, is a
**format specifier**: an instruction for how to render the value as
text, evaluated as part of the substitution rather than being separate
syntax. `C` formats as currency (using the current system culture's
symbol and decimal convention — `$` and two decimal places on a
US-configured machine); `F2` formats as a fixed-point number with
exactly two decimal places, no currency symbol. Both `{price}` (no
specifier) and `{price:F2}` produce numerically identical values,
`7.5`/`7.50` — the specifier changes only the text representation, never
the underlying `decimal` value itself.

### Discard

This `price` example is disposed of.

### Mechanical Walkthrough

- `decimal price = 7.5m;` — **(a) first appearance** of the `m` suffix on
  a numeric literal: marks this literal specifically as a `decimal`
  (rather than the `double` a plain `7.5` would default to) — `decimal`
  itself, and why money specifically should use it over `double`, is
  covered in full when this series' WPF arc first needs monetary values;
  flagged here only so the suffix syntax isn't mysterious.
- `{price:C}` / `{price:F2}` — **(a) first appearance**, explained above.

## Concept Unit: Nullable Reference Types

### The Problem

Java allows any reference variable to silently hold `null`, and a method
that forgets to check before dereferencing one crashes at runtime with a
`NullPointerException` — a bug class real enough to have its own
nickname ("the billion-dollar mistake," coined by the feature's own
inventor). C# has a real, compiler-enforced mechanism specifically aimed
at catching this class of bug *before* the program runs at all.

### Introduce the Concept in Isolation

```csharp
public class Program
{
    static void Greet(string name)
    {
        System.Console.WriteLine($"Hello, {name.ToUpper()}!");
    }

    public static void Main()
    {
        string? maybeName = null;
        Greet(maybeName);
    }
}
```

This produces a real compiler **warning** (not an error — the program
still compiles and runs, but the warning is the actual point):

```
warning CS8604: Possible null reference argument for parameter 'name' in 'void Program.Greet(string name)'.
```

`string? maybeName = null;` — the trailing `?` on `string?` marks this
one variable as explicitly allowed to hold `null`. `Greet(string name)`
— note `name`'s own parameter type has **no** `?` — declares "this
parameter must never be null." Passing the nullable `maybeName` into a
non-nullable parameter slot is exactly what triggers the warning: the
compiler is statically proving, from the flow of the code alone, that
`null` could reach `name.ToUpper()` inside `Greet` and crash it — and it
says so *before* the program ever runs, at compile time, rather than
waiting to discover it the hard way during execution.

### Discard

This `Greet`/`maybeName` pair is disposed of; the fixed version below
replaces it.

### Mechanical Walkthrough

- `string? maybeName = null;` — **(a) first appearance.** `string?`
  (any reference type followed by `?`) opts this one variable into
  "may be null" — without `<Nullable>enable</Nullable>` project-wide
  (the default in every current .NET template, already the case in any
  project generated by `dotnet new`), every reference type would be
  nullable with no warnings at all, the same permissive behavior Java
  has; this feature is what changes that default.
- `static void Greet(string name)` — **(c) already basic** as a method
  declaration; `string` here, with no `?`, is the actual signal that
  triggers the warning when a nullable value is passed to it.
- `name.ToUpper()` — **(c) already basic**, an ordinary method call; the
  real risk this whole feature exists to catch is exactly this line,
  which would throw a real `NullReferenceException` at runtime if `name`
  ever actually were `null` when this line ran.

### The Fix, Proven

```csharp
static void Greet(string? name)
{
    if (name is null)
    {
        System.Console.WriteLine("Hello, stranger!");
        return;
    }
    System.Console.WriteLine($"Hello, {name.ToUpper()}!");
}
```

With `name` itself now declared `string?` and a real `if (name is null)`
check guarding the risky line, the warning disappears entirely — the
compiler can see, from the code's own control flow, that
`name.ToUpper()` is only ever reached once `name is null` has already
been ruled out on the line above. This is the actual mechanism, not a
coincidence: the compiler performs real, flow-sensitive analysis of null
checks, not just a blanket "this variable might be null somewhere"
warning.

### CS Lens

**(b) hard concept, real restatement.** This is a language-level
instance of **static analysis** catching a class of bug (a null
dereference) at compile time instead of leaving it to be discovered at
runtime — the same general idea as a type checker catching
`name = 5;` on a `string` variable (this lesson's own first unit), now
applied specifically to nullability instead of type identity.

Also recognized in: Kotlin's own `String?` vs. `String` distinction
(spelled almost identically to C#'s, on purpose — both languages added
this after watching the same real-world bug class cost real money for
decades), TypeScript's `strictNullChecks` flag, and Rust's `Option<T>`
achieving the same guarantee through a completely different mechanism
(no null at all, ever, replaced by an explicit wrapper type).

## Connect the pieces

One trace: `var` infers a real, fixed type from an initializer — proven
by the type mismatch it still rejects, and by the one syntax gotcha
around multiple declarators. String interpolation (`$"..."`) is a
readable alternative to `+` concatenation, with `:X` format specifiers
controlling *how* a value renders without changing its underlying value.
Nullable reference types (`string?`) make the compiler itself prove,
statically, whether a `null` could reach a line that would crash on it —
all three are real C# language features with no exact Java equivalent,
proven here rather than assumed familiar.

## What breaks without this

Remove the `if (name is null) { ...; return; }` guard from the fixed
`Greet` above, keeping the parameter typed `string?`, and call it with
`Greet(null);` directly. This compiles (with the same CS8604-style
warning as before, since `null` is passed directly to a nullable-typed
parameter with no guard), and **crashes at runtime**:

```
Unhandled exception. System.NullReferenceException: Object reference not set to an instance of an object.
```

This is the exact failure nullable reference types exist to let you
catch *before* this point — the compiler warned about precisely this
possibility ahead of time; ignoring the warning and removing the guard
reproduces the real runtime crash the warning was trying to prevent.

## Exercises

1. Change `Greet`'s parameter back to non-nullable `string name` (no
   `?`), keep the `if (name is null)` check inside the body, and see
   what the compiler says about that check now — a real, provable
   demonstration of what changes once the compiler is certain, from the
   signature alone, that `null` can never legally arrive.
2. Write a small `decimal total` interpolated with `{total:P}` (a format
   specifier not shown above) against a value like `0.15m`, and note
   what real output it produces — confirm whether it's the currency,
   fixed-point, or some other rendering by actually reading the result.

## Definition of Done

- [ ] You caused the real `CS0029` type-mismatch failure and the real
      `CS0819` multiple-declarator failure, and understood both.
- [ ] You compiled and ran the concatenation vs. interpolation example
      and confirmed identical output from both.
- [ ] You saw the real `CS8604` nullable warning, then applied the
      `if (name is null)` fix and confirmed the warning disappeared.
- [ ] You caused the real `NullReferenceException` by removing the guard
      and calling `Greet(null);` directly.

## Next

[Lesson 04 — Value vs. Reference Semantics: `struct`, `record`,
`class`](lesson-04-struct-record-class.md) covers the one area where
copying a C# object can behave completely differently depending on which
of three keywords declared its type — something Java has no equivalent
distinction for at all.
