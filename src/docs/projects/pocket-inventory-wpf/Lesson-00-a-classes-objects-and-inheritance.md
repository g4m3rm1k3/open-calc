# Lesson 00a: A Blueprint Is Not the Thing It Builds

*(Prepended before Lesson 0 — see `CURRICULUM_NOTES.md`'s 2026-07-29
revision. Read this first. Every lesson from Lesson 0 onward uses
`class`, `object`, `constructor`, and `: BaseClass` inheritance as
already-known vocabulary, and none of them were ever taught from
scratch — this lesson is that missing foundation.)*

**Developer Story**
> As a developer who has never written a class in any language, I want
> to understand what a class, an object, and a constructor actually are
> — for real, not by comparison to something else — before I read a
> single line of C# that uses them.

**What you will build**
Nothing that survives — every example in this lesson is thrown away the
moment it's proven, on purpose (see `csharp-partial-classes.md`-style
convention: throwaway labs never become part of the real project). What
you'll actually walk away with: a real, tested, provable mental model
of what a `class` is, what `new` does, what a constructor guarantees,
and what `: BaseClass` inheritance actually gives you — the exact
vocabulary Lesson 0 starts using on its very first page.

**What you need to know first**
Basic Python only: functions, data types, loops, `list`, `dict`. Nothing
about classes or objects, in Python or any other language — if you've
never written `class` in *any* language before, this lesson assumes
exactly that and explains everything from zero. Nothing about C# or
.NET either.

**Terms introduced in this lesson:**
- **Class** — a blueprint describing what every object built from it
  will have (its fields) and be able to do (its methods). Writing a
  class does not create anything; it only describes what one *would*
  look like.
- **Object** (also called an **instance**) — a real, distinct thing in
  memory, built from a class's blueprint via `new`. Two objects from the
  same class are two separate things, each with its own copy of every
  field.
- **Field** — a named piece of data every object built from a class gets
  its own independent copy of.
- **Method** — a function that belongs to a class, with automatic access
  to whichever specific object it's currently running on.
- **`new`** — the keyword that actually builds a real object from a
  class's blueprint.
- **Constructor** — a method with the exact same name as its class and
  no return type, run automatically, once, the instant `new` builds a
  new object — before the calling code that ran `new` gets anything back.
- **Inheritance (`: BaseClass`)** — declaring one class as a more
  specific version of another; every object of the more specific
  (**derived**) class automatically has everything the more general
  (**base**) class defines, with nothing re-declared.
- **Base class / derived class** — the general class being extended
  (base) and the specific class extending it (derived); a derived class
  gains the base's members, never the other way around.
- **String interpolation (`$"..."`)** — a string literal prefixed with
  `$`, letting `{ }` embed a real expression directly inside the text;
  C# evaluates whatever is inside the braces and substitutes its actual
  value into the resulting string, in place, at that exact position.
  The direct cousin of Python's own f-strings (`f"..."`) — same idea,
  different prefix character.
- **Ternary conditional operator (`condition ? a : b`)** — a single
  expression, not a statement, that evaluates to `a` if `condition` is
  `true` and `b` if it's `false`. Exists specifically because an
  ordinary `if`/`else` is a *statement* (it runs code, it doesn't
  produce a value) — `?:` is the shorthand for the common case of
  choosing between two plain values inline, without a temporary
  variable and a multi-line `if`/`else` just to set it.

**Objects and methods used**
- **`Console`** — a `static` class from .NET's base class library
  representing this program's connection to the terminal it's running
  in. `static` means there is no `Console` *object* anywhere — you never
  write `new Console()` — because a running program has exactly one
  console, not a variable number of separate `Console` objects each with
  their own text. `Console.WriteLine(...)` is a `static` method on it:
  called on the class itself, not on an instance, for the same reason.
  Every real output shown in this lesson's labs comes from this one
  method, called with a plain string or a `$"..."`-interpolated one.

---

## Concept Unit: A Class Is a Blueprint, an Object Is a Thing Built From It

### The Problem

A function groups a sequence of steps under one name, but has no way to
group steps together with *data those steps need to remember* — and a
real program needs many separate things of the same kind (many
lightbulbs, many inventory items, many windows) each holding its own
values while running identical logic.

### Introduce the Concept in Isolation

Create a throwaway console project anywhere outside `PocketInventory/` —
it will not become part of the app:

```
dotnet new console -o ClassLab
cd ClassLab
```

Replace the generated `Program.cs`:

```csharp
Lightbulb kitchen = new Lightbulb();
kitchen.IsOn = true;

Lightbulb bedroom = new Lightbulb();
bedroom.IsOn = false;

kitchen.Describe();
bedroom.Describe();

class Lightbulb
{
    public bool IsOn = false;

    public void Describe()
    {
        Console.WriteLine($"This bulb is {(IsOn ? "on" : "off")}");
    }
}
```

Run it:

```
dotnet run
```

Real output:

```
This bulb is on
This bulb is off
```

*What this proves:* `kitchen` and `bedroom` are two separate things,
each holding its own `IsOn` — setting `bedroom.IsOn = false` had zero
effect on `kitchen.IsOn`, proven directly by the different output each
`Describe()` call produced. Both calls ran the *exact same* code (the
one `Describe` method, written once, inside `Lightbulb`), but each
printed something different — the same behavior, applied to two
different pieces of data. This is called a **class** (`Lightbulb`, the
blueprint) and an **object** or **instance** (`kitchen` and `bedroom`,
the two real, separate things built from it).

#### Execution Trace

1. `Lightbulb kitchen = new Lightbulb();` — a real, new `Lightbulb`
   object is built; its `IsOn` starts at `false`, because that's the
   value the field's own declaration (`public bool IsOn = false;`)
   gives every new object before anything else touches it.
2. `kitchen.IsOn = true;` — reaches into *this specific object*
   (`kitchen`) and overwrites its own `IsOn` to `true`. `bedroom`
   doesn't exist yet, so nothing else could possibly be affected.
3. `Lightbulb bedroom = new Lightbulb();` — a second, independent
   object is built, with its *own* fresh `IsOn`, defaulting to `false`
   again — because each `new` call runs the field initializer once per
   object, not once total.
4. `bedroom.IsOn = false;` — sets `bedroom`'s own `IsOn` explicitly
   (redundant here, since it was already `false`, but written for
   symmetry with `kitchen`'s own explicit `true`).
5. `kitchen.Describe();` — prints `"This bulb is on"`, because
   `Describe`, running specifically on `kitchen`, reads `kitchen`'s own
   `IsOn`, which step 2 set to `true`.
6. `bedroom.Describe();` — prints `"This bulb is off"`, because this
   same call, running on a *different* object, reads `bedroom`'s own
   `IsOn` — still `false` from step 3 — proving steps 1-4 never once
   touched the same memory twice.

### Discard the Throwaway Example

Delete the `ClassLab` folder. `Lightbulb` exists only to prove what a
class and an object are; it will not appear in Pocket Inventory.

### Mechanical Walkthrough

- `class Lightbulb { ... }` — (first appearance) a **class**: describes
  what every `Lightbulb` will have (`IsOn`) and be able to do
  (`Describe()`). This line alone builds zero lightbulbs — it only
  describes what one would look like, the same way a blueprint for a
  house isn't itself a house you can walk into.
- `public bool IsOn = false;` — (first appearance) a **field**: every
  object built from `Lightbulb` gets its own separate copy of this. The
  `= false` is a starting value, so a fresh bulb always has a real,
  defined `IsOn` even before anything sets it explicitly.
- `public void Describe() { ... }` — (first appearance) a **method**: a
  function that belongs to the class, with automatic access to
  *whichever object it's currently running on*'s own `IsOn` — not some
  single, shared value.
- `$"This bulb is {(IsOn ? "on" : "off")}"` — (first appearance) **string
  interpolation**: the `$` prefix means `{ ... }` inside this string is a
  real expression, evaluated and substituted in, not literal text —
  here, the expression is `(IsOn ? "on" : "off")` itself. That
  expression is a **ternary conditional operator**: if `IsOn` is `true`,
  the whole expression evaluates to the string `"on"`; if `false`, to
  `"off"` — one of exactly two values, chosen inline, with no separate
  `if`/`else` statement needed just to decide which string to print.
- `Lightbulb kitchen = new Lightbulb();` — (first appearance) `new
  Lightbulb()` is what actually builds a real object from the blueprint
  — a distinct thing in memory with its own copy of `IsOn`. `Lightbulb
  kitchen = ...` stores it under the name `kitchen`.
- `kitchen.IsOn = true;` — the `.` reaches into the specific object
  `kitchen` refers to and sets *its own* `IsOn` — `bedroom`'s `IsOn` is
  completely separate memory, untouched by this line, proven by the
  real output above.
- `kitchen.Describe();` — calls `Describe`, specifically on `kitchen` —
  this is *why* it prints "on" and not "off": inside `Describe`, `IsOn`
  resolves to *this specific object's own* `IsOn`, because `kitchen` is
  the object this particular call is running against.

### CS Lens

This is the foundational idea of **object-oriented programming**:
bundling data (fields) and the behavior that operates on it (methods)
into one unit (a class), then building many independent objects from
that one unit, each with its own copy of the data. A class is the
*template*; an object is one *real thing* built from it — the same
relationship a cookie cutter (one shape, reused) has to the actual
cookies it cuts (many, each a separate piece of dough).

Also recognized in: essentially every general-purpose language in
current use — the vocabulary (`class`/`object`, "instance," "field") is
close to identical across nearly all of them, so this exact mental
model transfers directly, including to C#'s own version of it, next.

### SE Lens

The alternative — separate, unconnected variables for every lightbulb
(`kitchen_isOn`, `bedroom_isOn`, a `DescribeKitchen()` function, a
`DescribeBedroom()` function...) — falls apart the moment a program
needs an unknown number of lightbulbs, or needs to pass "a lightbulb"
around as one value. A class lets `Describe()`'s logic be written
exactly once and reused correctly against any number of separately
created objects, each automatically supplying its own data.

### Connection

Every C# file from Lesson 0 onward that mentions a `class` — including
`Console` itself, `MainWindow`, and every model this project builds —
depends on this exact vocabulary.

---

## Concept Unit: Constructors — What Actually Runs When `new` Builds an Object

### The Problem

Some setup genuinely needs to happen every single time a new object is
built — no exceptions, no way for a caller to forget — before any of
that object's own methods are used on it.

### Introduce the Concept in Isolation

Same `ClassLab` folder pattern (`dotnet new console -o CtorLab`),
`Program.cs` replaced with:

```csharp
Console.WriteLine("About to build the kitchen bulb...");
Lightbulb kitchen = new Lightbulb(true);
Console.WriteLine("About to build the bedroom bulb...");
Lightbulb bedroom = new Lightbulb(false);

kitchen.Describe();
bedroom.Describe();

class Lightbulb
{
    public bool IsOn;

    public Lightbulb(bool startsOn)
    {
        IsOn = startsOn;
        Console.WriteLine($"Constructor ran, IsOn set to {IsOn}");
    }

    public void Describe()
    {
        Console.WriteLine($"This bulb is {(IsOn ? "on" : "off")}");
    }
}
```

Real output:

```
About to build the kitchen bulb...
Constructor ran, IsOn set to True
About to build the bedroom bulb...
Constructor ran, IsOn set to False
This bulb is on
This bulb is off
```

*What this proves:* `"Constructor ran..."` printed immediately after
each `"About to build..."` line — before the *next* statement in
`Main`'s own code ran — proof `Lightbulb(bool startsOn)`'s body executes
automatically, synchronously, the instant `new Lightbulb(...)` is
evaluated, not at some later or deferred point. It ran twice, once per
`new`, each time with the exact value passed in — proof it's real setup
code, not a one-time initializer. This method — same name as its class,
no return type — is called a **constructor**.

#### Execution Trace

1. `Console.WriteLine("About to build the kitchen bulb...");` — prints
   first, before any `Lightbulb` exists at all — nothing has been
   constructed yet.
2. `Lightbulb kitchen = new Lightbulb(true);` — `new` allocates the
   object, then immediately calls the constructor with `startsOn =
   true`, *before* this statement finishes and control returns to the
   line after it — the constructor's own `Console.WriteLine` proves
   this by printing `"Constructor ran, IsOn set to True"` before step 3
   ever runs.
3. `Console.WriteLine("About to build the bedroom bulb...");` — only
   reachable after step 2's `new` fully completed, including the
   constructor call inside it — real proof the constructor blocks
   until finished, not something scheduled for later.
4. `Lightbulb bedroom = new Lightbulb(false);` — same mechanism, a
   second time, with `startsOn = false` — prints `"Constructor ran,
   IsOn set to False"`, because this is a *fresh* call against a
   *different* object, not a rerun of step 2's.
5. `kitchen.Describe();` / `bedroom.Describe();` — both run *after*
   every constructor call above has already finished — proof the two
   objects were each fully, correctly initialized (`True`/`False`
   respectively) before either one's own behavior was ever used.

### Discard the Throwaway Example

Delete `CtorLab`. This exact `Lightbulb` will not appear again.

### Mechanical Walkthrough

- `public Lightbulb(bool startsOn) { ... }` — (first appearance) a
  **constructor**: a method with the exact same name as its class and
  no return type (not even `void`). C# recognizes this specific shape
  as "the code to run automatically when an object of this type is
  created."
- `IsOn = startsOn;` — (already basic, ordinary field assignment) —
  runs *inside* the constructor, meaning by the time `new Lightbulb(...)`
  finishes, `IsOn` is already set correctly — no separate setup call is
  ever needed or possible.
- `new Lightbulb(true)` / `new Lightbulb(false)` — (reappearing, `new`
  from the previous unit) — now passing a real argument, matching the
  constructor's own parameter list, exactly like calling any other
  method with a parameter.

### CS Lens

This is **object initialization** — guaranteeing a class's own
invariants (whatever must be true about an object for its methods to
work correctly) are established the moment the object exists, rather
than trusting every caller to remember a separate setup step.

Also recognized in: constructors exist, by this same name, in nearly
every class-based language — the guarantee they provide (fully set up
the instant `new` returns) is universal even where the exact syntax
differs.

### SE Lens

The alternative — a separate `Setup()`/`Init()` method a caller must
remember to call after `new` — is a real, common source of bugs: an
object used before its own setup ran, silently producing wrong behavior
instead of a clear failure. A constructor makes "fully set up" and
"exists at all" the same guaranteed moment, with no separate step a
caller can forget.

### Connection

Every `MainWindow()`/`InventoryPage()` constructor Lesson 0 onward
shows — always containing `InitializeComponent();` — is this exact
mechanism, guaranteeing the visual tree is built before the window is
used any further.

---

## Concept Unit: Inheritance — One Class Extending Another

### The Problem

Two classes are sometimes genuinely related — a smart bulb really *is a
kind of* bulb, and shares real behavior with a plain one — but writing
`IsOn`/`Describe()` again, word for word, inside a second class
duplicates something already fully described elsewhere.

### Introduce the Concept in Isolation

`dotnet new console -o InheritLab`, `Program.cs` replaced with:

```csharp
SmartLightbulb hallway = new SmartLightbulb(true);
hallway.Describe();
hallway.SetBrightness(70);

class Lightbulb
{
    public bool IsOn;

    public Lightbulb(bool startsOn)
    {
        IsOn = startsOn;
    }

    public void Describe()
    {
        Console.WriteLine($"This bulb is {(IsOn ? "on" : "off")}");
    }
}

class SmartLightbulb : Lightbulb
{
    public SmartLightbulb(bool startsOn) : base(startsOn)
    {
    }

    public void SetBrightness(int percent)
    {
        Console.WriteLine($"Brightness set to {percent}% (IsOn is {IsOn})");
    }
}
```

Real output:

```
This bulb is on
Brightness set to 70% (IsOn is True)
```

*What this proves:* `SmartLightbulb` never declares an `IsOn` field or a
`Describe()` method anywhere in its own body — yet `hallway.Describe()`
runs successfully, and `SetBrightness` reads `IsOn` directly, with no
re-declaration. `SmartLightbulb : Lightbulb` really did give
`SmartLightbulb` everything `Lightbulb` has, for free. This is called
**inheritance**.

Reversing the relationship — building a plain `Lightbulb` and calling
`.SetBrightness()` on it:

```csharp
Lightbulb plain = new Lightbulb(true);
plain.SetBrightness(50);
```

Real, captured failure:

```
error CS1061: 'Lightbulb' does not contain a definition for
'SetBrightness' and no accessible extension method 'SetBrightness'
accepting a first argument of type 'Lightbulb' could be found
```

*What this proves:* inheritance flows one direction only. `SmartLightbulb`
gained everything `Lightbulb` has; `Lightbulb` gained nothing from
`SmartLightbulb` — it has no idea `SmartLightbulb`, or `SetBrightness`,
even exist.

### Discard the Throwaway Example

Delete `InheritLab`. Neither `Lightbulb` nor `SmartLightbulb` will
appear again.

### Mechanical Walkthrough

- `class SmartLightbulb : Lightbulb` — (first appearance) the colon
  means **inheritance**: `SmartLightbulb` is declared as a more specific
  version of `Lightbulb`. Every `SmartLightbulb` *is a* `Lightbulb`,
  plus whatever extra `SmartLightbulb` itself adds. `Lightbulb` here is
  the **base class**; `SmartLightbulb` is the **derived class**.
- `public SmartLightbulb(bool startsOn) : base(startsOn)` — (first
  appearance) a derived class's own constructor can forward arguments
  straight to the base class's constructor via `: base(...)` — required
  here because `Lightbulb` has no parameterless constructor of its own;
  something has to supply that `bool` before `Lightbulb`'s own
  constructor can run. The base constructor runs *first*, fully, before
  `SmartLightbulb`'s own constructor body (empty here) runs at all.
- `hallway.Describe();` — calls a method `SmartLightbulb` never wrote —
  resolves to `Lightbulb`'s own `Describe`, because after inheritance
  there's no real difference between "defined here" and "defined on the
  base" from a calling object's point of view.
- `SetBrightness(int percent) { ... IsOn ... }` — reads `IsOn` directly,
  a field declared on `Lightbulb`, not `SmartLightbulb` — legal because
  a derived class's own methods have the same access to inherited
  fields as the base class's own methods do.
- `plain.SetBrightness(50);` (the broken variant) — fails to compile
  because the relationship is not symmetric; `Lightbulb` was written
  with no knowledge that `SmartLightbulb` — or anything inheriting from
  it — would ever exist.

### CS Lens

**Inheritance** is one of the core mechanisms of object-oriented
programming: defining a new class in terms of an existing one, reusing
its members instead of re-declaring them, expressing a genuine "is a
more specific kind of" relationship rather than "these two classes
happen to look similar."

Also recognized in: nearly every object-oriented language uses this
same vocabulary (base/parent/super class, derived/child/sub class) —
the concept, once real here, transfers directly to C#'s own use of it
starting in the very next lesson.

### SE Lens

The alternative — copying `IsOn`/`Describe()`'s code into every kind of
bulb a program might need — means a later fix has to be repeated,
correctly, in every copy, or the copies quietly drift apart. Inheritance
keeps genuinely shared behavior in exactly one place; the real cost is
that a derived class's full behavior is no longer visible in one file —
reading `SmartLightbulb` alone doesn't show `Describe()` exists at all.

### Connection

`public partial class MainWindow : Window` (Lesson 0/1) and `public
partial class HomePage : Page` (Lesson 3) are this exact mechanism —
`MainWindow` and `HomePage` gain every capability the real WPF `Window`/
`Page` classes already have, which is why `this.Title = "..."` and
similar calls work with no code in those files ever defining them.

---

## Closing

### Connect the Pieces

One throughline: a `class` is a blueprint (Unit 1) describing fields and
methods; `new` builds a real, independent object from it, proven by two
`Lightbulb`s holding different `IsOn` values with zero interference. A
**constructor** (Unit 2) is the one guaranteed place setup code runs,
automatically, the instant `new` is evaluated — proven by real output
ordering, not just assertion. **Inheritance** (Unit 3) lets one class
declare itself a more specific version of another via `: BaseClass`,
gaining every field and method the base already has for free — proven
by `SmartLightbulb` successfully calling a method it never wrote, and
disproven in reverse by a real `CS1061` compiler error. Every one of
these three ideas — class, object, constructor, inheritance — is used
by name, unexplained, starting on Lesson 0's very first page; this
lesson is what makes that page actually make sense.

### What Breaks Without This

Already demonstrated directly, on purpose, in Unit 3: calling a
derived-only method on a base-class object produces a real, immediate
`CS1061` compile error — proof inheritance is checked by the compiler,
not a convention. No further break-it exercise needed this lesson.

### Exercises

- In `ClassLab`'s `Lightbulb`, add a second field, `public int
  BrightnessPercent = 100;`. Confirm two objects still hold independent
  values for it, the same way `IsOn` already proved.
- In `CtorLab`, add a *second* constructor to `Lightbulb` that takes no
  arguments at all (`public Lightbulb() { IsOn = false; }`). Build both
  a `new Lightbulb()` and a `new Lightbulb(true)` in the same `Main` —
  confirm C# picks the right one automatically based on how many
  arguments you pass.
- In `InheritLab`, add a *second* derived class, `class DimmerLightbulb
  : Lightbulb`, with its own method. Confirm it can call `Describe()`
  too, with zero code shared directly between `SmartLightbulb` and
  `DimmerLightbulb` — both only share code *through* `Lightbulb`.

### Definition of Done

- [ ] You ran all three labs yourself and got the exact real output
      shown above, not just read it.
- [ ] You can explain, in your own words and without re-reading this
      lesson, the difference between a class and an object.
- [ ] You caused the real `CS1061` error yourself in Unit 3, read it,
      and can explain why it happens.
- [ ] You completed the three Exercises above and observed the
      described behavior yourself.
- [ ] You can point to the exact sentence in Lesson 0 that uses "class"
      for the first time, and explain it without help.
