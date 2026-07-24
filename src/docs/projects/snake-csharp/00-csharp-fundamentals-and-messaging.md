# Lesson 0: C# Fundamentals, and What "Object-Oriented" Actually Means

**Developer Story**
> As a developer with real programming experience in another language, I want
> to learn C#'s own syntax and rules from zero, and understand what
> object-oriented programming actually means before I start using it.

**What you will build**
Nothing in Snake yet — this lesson is the foundation everything else stands
on. By the end you'll have the .NET SDK confirmed working, a real class with
fields, a constructor, and methods, and a working mental model of what
"object-oriented" is actually supposed to mean — not the class-and-inheritance
toolkit most tutorials lead with, but the idea the term was originally coined
to describe.

**What you need to know first**
Real programming experience — loops, conditionals, functions, variables — in
some other language (Python, JavaScript, whatever you already know). Nothing
about C#, nothing about OOP, and nothing from any other project in this
curriculum is assumed.

---

## Concept Unit: Compiled and Statically Typed

### The Problem

You already know how your current language checks (or doesn't check) whether
a value is used correctly. C# checks earlier, and differently, than a
language like Python does — worth seeing directly before anything else,
because almost every confusing C# error you'll hit early on traces back to
this one difference.

### Introduce the concept in isolation

```python
# throwaway_typecheck.py
def add(a, b):
    return a + b

print(add(2, 3))
print(add("2", "3"))
```

Run it:

```bash
python3 throwaway_typecheck.py
```

Real output — verified this session:

```text
5
23
```

*What this proves:* Python's `add` doesn't care what type `a` and `b`
actually are — it just tries `a + b` and does whatever `+` means for
whatever showed up. Called with numbers, that's addition (`5`). Called with
strings, `+` means concatenation, so `add("2", "3")` doesn't fail — it
silently returns `"23"`, a plausible-looking but almost certainly unintended
result if you meant to add numbers. Nothing about this is an error. It's a
completely successful run that did something different from what you likely
meant, and Python had no way to warn you, because it never checks a
function's argument types until the exact moment it runs.

Now the same shape, in C#:

```csharp
int Add(int a, int b)
{
    return a + b;
}

Console.WriteLine(Add(2, 3));
Console.WriteLine(Add(2, "3"));
```

Run it:

```bash
dotnet run
```

Real output — verified this session:

```text
Program.cs(7,26): error CS1503: Argument 2: cannot convert from 'string' to 'int'
The build failed. Fix the build errors and run again.
```

*What this proves:* `Add(2, 3)` on line 6 is completely valid C# — it never
ran. Nothing printed, not even the correct call's result. C# read the *entire
file*, found that line 7 passes a `string` where `Add` demands an `int`, and
refused to produce a runnable program at all. This is the actual, mechanical
difference: Python checks types while running, one operation at a time;
C# checks every type in the whole program before running any of it.

### Discard the throwaway examples

Both files are discarded. Neither becomes part of Snake.

### CS Lens

This is **static typing** combined with **compilation** — every value's type
is fixed and checked against every use of it, by a dedicated pass over the
whole program (the compiler) before execution ever begins. This is the
opposite of Python's or JavaScript's **dynamic typing**, where a value's type
is checked, if at all, at the exact moment an operation touches it.

Also recognized in: Java, Rust, Swift, TypeScript (checked by a separate tool
before the JavaScript it produces ever runs) — any language where "does this
program even type-check" has an answer before line one executes.

### SE Lens

The real tradeoff: static typing catches an entire category of bugs before
the program ever runs, at the cost of writing more upfront — every parameter
and return type has to be declared, and the compiler won't let you defer that
decision the way Python happily lets you. The payoff, concretely: no lesson in
this entire project will ever ship a bug where the wrong type silently
produces a plausible-but-wrong answer three functions away from where the
mistake actually was — the compiler catches that class of mistake at the
exact line responsible, before the program runs at all.

### Connection

Every value in every remaining lesson has a fixed, checked type — `var` (next
unit) doesn't change this; it just changes who writes the type down.

---

## Concept Unit: `var` and Type Inference

### The Problem

Writing `int length = 4;` names the type explicitly. Most of the time, the
type is completely obvious from the value on the right — writing `int` at all
feels redundant. C# has a keyword for this, and it's worth understanding
precisely, because it looks like Python's plain `name = value` and is not the
same thing at all.

### Introduce the concept in isolation

```csharp
var name = "Byte";
var length = 4;
Console.WriteLine($"{name} the snake has eaten {length} pieces of food.");
```

Run it:

```bash
dotnet run
```

Real output — verified this session:

```text
Byte the snake has eaten 4 pieces of food.
```

*What this proves so far:* `var` let you skip writing `string` and `int`
explicitly. But `name` and `length` are still permanently, statically typed
from this point on — the compiler inferred `string` and `int` from the
literal values on the right, once, and will enforce those types exactly as if
you'd written them by hand. Prove it:

```csharp
var a = 5;
a = "not a number";
```

Real output — verified this session:

```text
Program.cs(6,5): error CS0029: Cannot implicitly convert type 'string' to 'int'
```

*What this proves:* `var` chose a type once, at declaration, and never
revisits that choice — this is exactly the static typing from the previous
unit, with the compiler writing the type annotation instead of you.

### The exact gotcha worth knowing before it surprises you

```csharp
var x, y = 5;
```

Real output — verified this session:

```text
Program.cs(1,1): error CS0819: Implicitly-typed variables cannot have multiple declarators
Program.cs(1,5): error CS0818: Implicitly-typed variables must be initialized
```

*What this proves:* `var` requires the compiler to infer a type from exactly
one initializer on the same line. `int x, y = 5;` is completely legal C#
(declaring two `int`s, `x` uninitialized and `y` set to `5`) — `var` cannot
do the same thing, because it would be ambiguous what type `x` should
even be. The fix is one `var` declaration per line:

```csharp
var x = 5;
var y = 10;
```

### Discard the throwaway examples

All deleted. `var` is used throughout this project going forward, for any
local variable whose type is obvious from the same line.

### CS Lens

This is **type inference** — the compiler deriving a type from context
instead of requiring an explicit annotation, while remaining fully static:
the type is still fixed at compile time, `var` only changes who writes it.

### SE Lens

Why does C# allow `var` at all instead of requiring explicit types
everywhere? Readability at the point of declaration — `var length = 4;`
reads cleanly, and the type is one hover away in any real editor. The real
tradeoff: `var` on a line where the right side's type isn't visually obvious
(`var result = ComputeSomething();`) forces a reader to go find what
`ComputeSomething` returns — this project uses `var` when the type is
obvious from the same line, and an explicit type otherwise.

### Connection

Every local variable from here on is declared with `var` or an explicit
type — never left to Python-style untyped assignment.

---

## Concept Unit: String Interpolation

### The Problem

The examples above already used `$"{name} the snake..."` without
explanation — worth naming directly before moving on, since it appears
constantly from here forward.

### The construct, named

`$"..."` is a string literal prefixed with `$`. Anything inside `{ }` is a
real C# expression, evaluated and inserted into the string at that exact
point. `$"{name} the snake has eaten {length} pieces of food."` embeds two
variables directly; you can embed any expression, not just a bare variable —
`$"{length + 1} segments"` is equally valid.

### CS Lens

This is **string interpolation** — the same idea as Python's f-strings
(`f"{name}"`) and JavaScript's template literals (`` `${name}` ``), with C#
choosing `$` as its own delimiter. Under the hood, the compiler rewrites
`$"..."` into a call to `string.Format(...)` — it's convenient syntax over a
mechanism that already existed, not new runtime behavior.

### SE Lens

The alternative, `"Result: " + name + " has " + length` string concatenation
with `+`, works but scales badly — adding a fourth piece means finding the
right spot in a chain of `+`s. Interpolation keeps each value visually next
to the exact text it fills in.

### Connection

Every piece of on-screen text this project ever builds uses interpolation,
not concatenation.

---

## Concept Unit: Methods — Parameters and Return Types

### The Problem

`Add(int a, int b)` from the first unit is a **method** — worth naming its
parts directly, since every action Snake ever takes (moving, growing,
checking collisions) is a method.

### The construct, named

```csharp
int Add(int a, int b)
{
    return a + b;
}
```

`int` before the name is the method's **return type** — a checked promise
that calling `Add(...)` always produces an `int`. `Add` is the method's
name. `(int a, int b)` is the **parameter list** — each parameter has an
explicit, required type, unlike Python's `def add(a, b):`, where neither
parameter carries a type annotation at all by default. `return a + b;` sends
the computed value back to whoever called the method.

A method that doesn't need to return anything uses `void` instead of a real
type:

```csharp
void Announce(string message)
{
    Console.WriteLine($"Announcement: {message}");
}
```

`void` is not a type you can create a value of — it's a specific, checked
statement that this method's job is an action, not a computation with a
result.

### CS Lens

Methods are C#'s unit of **procedural abstraction** — the same idea as a
Python `def` or a JavaScript `function`, with C#'s specific requirement that
every parameter and the return value all have a declared, checked type,
consistent with the static typing this entire lesson has been building on.

### Connection

Every capability Snake has — moving, growing, drawing itself — is a method,
starting with the very next unit's `Snake` class.

---

## Concept Unit: Classes — Fields, Constructors, and Methods

### The Problem

A method alone can't remember anything between calls — Snake needs to
remember its own name and how long it currently is, across many separate
method calls, for the entire time the game runs. A **class** is C#'s
construct for bundling data that persists with the methods that act on it.

### Introduce the concept in isolation

```csharp
var snake = new Snake("Byte");
snake.Grow();
snake.Grow();
Console.WriteLine(snake.DescribeSelf());

class Snake
{
    private string name;
    private int length;

    public Snake(string name)
    {
        this.name = name;
        this.length = 1;
    }

    public void Grow()
    {
        length = length + 1;
    }

    public string DescribeSelf()
    {
        return $"{name} is {length} segments long.";
    }
}
```

Run it:

```bash
dotnet run
```

Real output — verified this session:

```text
Byte is 3 segments long.
```

*What this proves:* `snake` remembered its own `name` and `length` across
three separate method calls (`Grow()`, `Grow()`, `DescribeSelf()`) — this is
what a class actually buys you over a standalone method: state that
persists, owned by one specific object, updated by that object's own
methods.

### Mechanical walkthrough

1. `class Snake { ... }` — (first appearance) declares a new type — a
   blueprint, not a runnable value on its own.
2. `private string name; private int length;` — (first appearance)
   **fields** — data every `Snake` object carries. `private` means only code
   inside `Snake` itself can read or write them directly — nothing outside
   this class can reach in and change `length` by hand.
3. `public Snake(string name) { ... }` — (first appearance) the
   **constructor** — a special method, named exactly after the class, that
   runs once, when a `Snake` is first created, setting up its initial state.
   `public` means code outside the class is allowed to call it (via `new`).
4. `this.name = name;` — (first appearance) `this` refers to the specific
   object being constructed right now — necessary here because the
   constructor's parameter is also named `name`; `this.name` (the field)
   and `name` (the parameter) would otherwise be indistinguishable text.
5. `new Snake("Byte")` — (first appearance) `new` allocates a real `Snake`
   object in memory and runs its constructor with `"Byte"` as the `name`
   argument — the result is a genuine, independent object, stored in the
   variable `snake`.
6. `snake.Grow();` — a **method call** on a specific object — `Grow` runs
   with `this` bound to `snake` specifically, so `length = length + 1;`
   modifies *that* object's `length`, not some other `Snake`'s.
7. `public void Grow()` / `public string DescribeSelf()` — (hard concept
   reappearing) ordinary methods, per the previous unit — `public` means
   code outside the class can call them; this is the class's actual
   contract with the rest of the program.

### CS Lens

This is **encapsulation** — `name` and `length` are `private`, so nothing
outside `Snake` can corrupt them directly; the only way to change a `Snake`'s
length is to call `Grow()`, which `Snake` itself controls completely. The
object owns its own state and the rules for changing it.

### SE Lens

Why make the fields `private` instead of just letting anyone read and write
`snake.length` directly? Because the moment external code can set `length`
to anything at all — including nonsense like `-5` — `Snake` can no longer
guarantee its own state makes sense. Keeping the fields private and offering
`Grow()` as the only way to change `length` means `Snake` can enforce its own
rules (length only ever increases by exactly one, say) in exactly one place,
instead of trusting every piece of calling code to change it correctly.

### Connection

Every game object Snake has — the snake itself, food, the board — is a class
built exactly this way: private fields, a constructor, public methods as the
only way in or out.

---

## Concept Unit: Collections — `List<T>`

### The Problem

A single `int` or `string` field holds one value. Snake's actual body is a
sequence of positions that grows over time — you need a collection type that
can hold many values of the same kind and grow.

### Introduce the concept in isolation

```csharp
List<string> foods = new List<string>();
foods.Add("apple");
foods.Add("mouse");
foods.Add("egg");
Console.WriteLine($"Food count: {foods.Count}");
foreach (string food in foods)
{
    Console.WriteLine($"- {food}");
}
```

Run it:

```bash
dotnet run
```

Real output — verified this session:

```text
Food count: 3
- apple
- mouse
- egg
```

*What this proves:* `List<string>` grows as you `Add` to it, `Count` reports
its current size, and `foreach` visits every element in the order it was
added. `<string>` is a **generic type parameter** — it tells the compiler
this specific list only ever holds `string`s; adding anything else (an `int`,
say) would be a compile error, the same static-checking guarantee from the
first unit, applied to a collection instead of a single value. Lesson 18
builds your own generic type from scratch; for now, `List<T>` is a tool the
.NET standard library already provides.

### Discard the throwaway example

Deleted. `List<T>` (and, starting Lesson 3, `LinkedList<T>`) are used for
real throughout this project.

### CS Lens

This is **generic programming** — one collection type, written once,
usable for any element type, with the compiler checking correctness at
every use site. The same mechanism this curriculum's Kotlin and Java tracks
call generics too — `List<T>` in C# is directly analogous to Kotlin's
`List<T>` and Java's `List<T>`, differing mainly in declaration syntax.

### Connection

Lesson 3 needs a collection that can grow at the *front* efficiently, not
just the end — which is exactly where `List<T>` stops being the right tool
and `LinkedList<T>` takes over.

---

## Concept Unit: What "Object-Oriented" Actually Means

### The Problem

Every unit so far has used classes and methods without asking what the term
"object-oriented programming" is actually supposed to mean. Most
introductions define it as "classes, inheritance, and polymorphism" — a
description of C#'s and Java's specific feature set, not the actual idea the
term was coined to describe.

### Where the term came from, and what it was supposed to mean

Alan Kay coined "object-oriented programming" in the 1970s, building the
Smalltalk language at Xerox PARC. Decades later, in a widely-quoted 2003
email, he said this about his own term:

> "I'm sorry that I long ago coined the term 'objects' for this topic
> because it gets many people to focus on the lesser idea. The big idea is
> 'messaging'... The key in making great and growable systems is much more
> the design of how its modules communicate rather than what their internal
> properties and behaviors should be."

Kay's own mental model came from biological cells and networked
computers — independent things, each completely in control of its own
internal state, communicating with each other only by sending messages
neither side has to understand the internals of. A cell doesn't reach
inside another cell and rearrange its molecules directly; it sends a
chemical signal, and the receiving cell decides, on its own terms, how to
respond.

### The concrete C# connection, right now

Look back at `snake.Grow();` from the previous unit. In Kay's original
framing, this line is not fundamentally different from a cell sending a
signal: **you are sending the `snake` object a message called `Grow`, and
`snake` — not you — decides what happens in response**, using state
(`length`) that you, outside the object, cannot see or touch directly,
because it's `private`. C# spells this as a method call instead of
Smalltalt's literal message-passing syntax, but the underlying idea is
identical: an object's entire public surface (its `public` methods) is the
set of messages it's willing to receive, and everything `private` is
internal machinery the sender never needs to know about.

### CS Lens

This reframing matters because two ideas that get taught as separate,
unrelated C# features turn out to be the same idea, seen twice.
**Encapsulation** (the previous unit's `private` fields) is what makes an
object's internals genuinely invisible to a message sender. **Polymorphism**
(introduced properly in Lesson 5) is what lets the *same* message
(`Draw()`, say) produce genuinely different behavior depending on which
concrete object actually receives it — this is Kay's "late binding," the
receiver deciding how to respond, at the moment the message arrives, not
before.

Also recognized in: every publish/subscribe system (Lesson 10 makes this
connection directly), every plugin architecture where a host program sends
a message to plugins it's never seen the source code of, and — at the
extreme — actual biological cell signaling and actor-model concurrent
systems, both of which directly inspired Kay's own thinking.

### SE Lens

Why does this framing matter more than just memorizing "OOP means classes
and inheritance"? Because inheritance (which C# supports, and this project
uses sparingly and deliberately) is one *possible* way to share behavior
between objects — it is not what makes something object-oriented in Kay's
sense. A system built from small, independent objects that communicate
through clean message contracts (interfaces, events) is deeply
object-oriented in the original sense, with or without a single
inheritance relationship anywhere in it. This project will build several
real design patterns — Publish/Subscribe (Lesson 10) and Dependency
Injection (Lesson 11) most directly — that are, underneath their names,
direct engineering answers to Kay's actual question: how do independent
objects communicate without needing to know each other's internals?

### Connection

Lesson 5's interfaces are the next, sharper version of this idea: a formal,
compiler-checked promise about exactly which messages an object can
receive, independent of what concrete type it actually is.

---

## Concept Unit: Project Setup and the Console

### The Problem

Every example above needs somewhere to actually run. Before Lesson 1 starts
building the real game, confirm the toolchain works.

### Commands needed

```bash
dotnet --version
```

Confirms the .NET SDK is installed — `dotnet` is the command-line tool the
SDK provides for building, running, and creating projects. Verified on the
machine this lesson was written on:

```text
9.0.100
```

You may see a newer number — .NET releases a new version yearly; the
concepts in this project don't depend on the exact version.

```bash
dotnet new console -o Snake
cd Snake
```

`dotnet new` scaffolds a new project from a named template; `console` is a
plain terminal program with no UI framework attached — exactly what this
project needs. `-o Snake` names the output folder. This creates a
`Program.cs` file and a `Snake.csproj` project file.

```bash
dotnet run
```

Builds and runs the project. The default template already prints
`Hello, World!` — confirm you see that before moving on to Lesson 1, which
replaces it with the game's first real output.

### SE Lens

Why a plain console project instead of anything else? Because this entire
project's point is learning C# and object-oriented design with the absolute
minimum ceremony around it — no UI framework's own concepts (this
curriculum's WPF course covers that separately) competing for your
attention. Every concept from here forward is either C# itself or a design
idea, never "how does this specific UI toolkit want me to structure things."

---

## Closing

### Connect the pieces

Static typing and `var` (units 1–2) mean every value in this project has a
fixed, compiler-checked type, inferred or explicit. String interpolation
(unit 3) and methods (unit 4) are the basic vocabulary everything else is
written in. Classes (unit 5) bundle private state with the public methods
that are the only way to reach it — which unit 7 named directly as Kay's
actual idea: objects communicating through messages, not through reaching
into each other's internals. `List<T>` (unit 6) is the first generic type
this project uses, before Lesson 18 builds one from scratch.

### What breaks without this

Remove `private` from `Snake`'s fields (make them public) and add a line
outside the class setting `snake.length = -999;` directly. Real,
observable consequence: `DescribeSelf()` now reports `"Byte is -999
segments long."` — nonsense, and nothing in `Snake` itself prevented it,
because the field was reachable from outside its own message contract.
Restore `private` and the only way to change `length` is through `Grow()`,
which `Snake` itself controls.

### Exercises

- Write a `Shrink()` method on `Snake` that decreases `length` by one, but
  never below `1` — decide, and justify, what should happen if `Shrink()`
  is called when `length` is already `1`.
- Trigger the real `CS0819`/`CS0818` errors from the `var` gotcha yourself,
  not just read about them.
- Find one more everyday example (outside programming entirely) where two
  independent things communicate only through a message, never by directly
  reaching into each other's internals — write it down in your own words.

### Definition of done

- [ ] `dotnet --version` and `dotnet new console` both work on your machine.
- [ ] You triggered the real Python-vs-C# type-checking difference yourself.
- [ ] You triggered the real `var` multi-declarator errors yourself.
- [ ] `Snake`'s constructor, `Grow()`, and `DescribeSelf()` all work,
      verified with real output.
- [ ] You can explain, in your own words, Alan Kay's messaging idea, and
      connect it directly to `snake.Grow()` as a concrete example, not just
      recite the quote.
- [ ] Commit: `git commit -m "Confirm C# toolchain and language fundamentals — no game code yet, prerequisite for Lesson 1"`.
