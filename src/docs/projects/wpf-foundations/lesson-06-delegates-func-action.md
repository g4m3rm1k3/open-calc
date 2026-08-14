# Lesson 06: `Func<>` and `Action<>` — Delegates You Don't Declare Yourself

**What you will build:** a throwaway proof that `Func<>`/`Action<>` are
ordinary generic types, not special syntax — and a small method that
*accepts* a delegate as a parameter, the exact shape "pass behavior into
another method" that every later WPF event/command lesson depends on.

**What you need to know first:** [Lesson 05](lesson-05-lambda-expressions.md)
(`delegate`, lambda expressions) and this codebase's own prior treatment
of generics from the Android/Kotlin curriculum (`List<T>`-shaped
generics, assumed already understood — only the *delegate* use of
generics is new here).

**Terms introduced in this lesson:**
- **`Func<T1, ..., TResult>`** — a built-in generic delegate type whose
  last type parameter is always the return type; everything before it is
  the parameter list, in order.
- **`Action<T1, ...>`** — the built-in generic delegate type for a method
  that returns nothing (`void`).

**Objects and methods used:** none beyond `System.Console.WriteLine`,
already covered.

---

## Concept Unit: `Func<>` — A Generic Delegate, Not New Syntax

### The Problem

Lesson 05's `delegate int Operation(int a, int b);` had to be declared
by hand before it could be used at all. Hand-declaring a new `delegate`
type every time a slightly different method shape is needed — one
parameter here, three there, a different return type somewhere else — is
real, repetitive ceremony. Does C# ship something that covers the common
cases without a new `delegate` declaration every time?

### Introduce the Concept in Isolation

```csharp
using System;

public class Program
{
    public static void Main()
    {
        Func<int, int, int> add = (a, b) => a + b;
        Console.WriteLine(add(3, 4));

        Func<string, int> length = s => s.Length;
        Console.WriteLine(length("Drill"));
    }
}
```

Output:
```
7
5
```

`Func<int, int, int> add = (a, b) => a + b;` — no `delegate` declared
anywhere by hand, and yet `add` works exactly like Lesson 05's
hand-declared `Operation` did. `Func<int, int, int>` — is not special
syntax at all; it's an ordinary **generic type** (the identical bracket
mechanism as `List<T>`, already known), built into .NET specifically to
describe method shapes. Reading its type parameters left to right: every
one except the *last* is a parameter type, in order; the *last* one is
always the return type. `Func<int, int, int>` therefore means "takes two
`int`s, returns an `int`" — exactly `Operation`'s shape, expressed with
zero custom `delegate` declaration. `Func<string, int>` — one parameter
(`string`), one return type (`int`) — proves the same reading rule at a
different arity: `length`'s lambda, `s => s.Length`, takes a `string`
and returns its `int` length.

### Discard

`add`/`length` are deleted; the next unit builds a fresh example using
`Action<>` instead.

### Mechanical Walkthrough

- `Func<int, int, int> add = (a, b) => a + b;` — **(a) first appearance**
  of `Func<>` itself, explained above. `(a, b) => a + b` — **(b) hard
  concept reappearing**, the identical lambda syntax from Lesson 05, now
  satisfying a built-in generic delegate type instead of a hand-declared
  one — proof the lambda mechanism itself didn't change at all; only
  which delegate type it's being checked against did.
- `Func<string, int> length = s => s.Length;` — **(a) first appearance**
  of one further shorthand: `s => s.Length`, a single-parameter lambda,
  **drops the parentheses** around the parameter list entirely — `(s) =>
  ...` and `s => ...` are identical; the parentheses become optional
  specifically when there's exactly one parameter with an inferred type.
  `s.Length` — **(c) already basic**, an ordinary property read on a
  `string` (`Length`, a real, already-familiar property from Java's own
  `String.length()` — spelled as a property here rather than a method
  call, the exact property-vs-method distinction Lesson 02 covered).

## Concept Unit: `Action<>` — The Same Idea, No Return Value

### The Problem

Not every piece of behavior returns something — logging a message,
printing to the console, saving a value. `Func<>` always requires a
return type as its last parameter, with no way to say "and nothing comes
back." Something else is needed for that case.

### Introduce the Concept in Isolation

```csharp
using System;

public class Program
{
    public static void Main()
    {
        Action<string> log = msg => Console.WriteLine($"LOG: {msg}");
        log("Starting up");

        Action greet = () => Console.WriteLine("Hello!");
        greet();
    }
}
```

Output:
```
LOG: Starting up
Hello!
```

`Action<string> log = msg => Console.WriteLine($"LOG: {msg}");` —
`Action<string>` describes "takes a `string`, returns nothing" —
`Action<>`'s type parameters are **only** the parameter types; there is
never a return-type slot, because an `Action` always returns `void`.
`Action greet = () => Console.WriteLine("Hello!");` — plain `Action`,
with **no** type parameters at all, describes a method taking *no*
parameters and returning nothing; `()` is the empty parameter list, still
required even with zero parameters.

### Discard

`log`/`greet` are deleted — this proof exists only to isolate
`Action<>`'s shape.

### Mechanical Walkthrough

- `Action<string> log = ...` — **(a) first appearance** of `Action<>`,
  explained above.
- `msg => Console.WriteLine($"LOG: {msg}");` — **(c) already basic**, the
  same single-parameter-no-parens lambda shorthand just proven in the
  previous unit, with a `Console.WriteLine`/interpolation body — both
  already known (Lessons 01, 03).
- `Action greet = () => Console.WriteLine("Hello!");` — **(a) first
  appearance** of the zero-parameter case specifically: `()` with
  nothing inside, required syntax even though there are no parameters to
  list.
- `log("Starting up");` / `greet();` — **(b) hard concept reappearing**,
  the same delegate-call syntax from Lesson 05, applied to `Func<>`'s
  `void`-returning cousin.

## Concept Unit: Accepting a Delegate as a Method Parameter

### The Problem

Every delegate use so far has been a local variable, called directly in
the same method it was declared in. The real payoff of a first-class
function value is passing it *into* another method — "run this specific
logic as part of your own work" — the exact shape a WPF event
subscription or a LINQ query (Lesson 08) needs.

### Introduce the Concept in Isolation

```csharp
using System;

public class Program
{
    static void RunTwice(Action work)
    {
        work();
        work();
    }

    public static void Main()
    {
        RunTwice(() => Console.WriteLine("Tick"));
    }
}
```

Output:
```
Tick
Tick
```

`static void RunTwice(Action work)` — an ordinary method, but its one
parameter, `work`, is typed as `Action` — a delegate type, not a plain
data type. `RunTwice` doesn't know or care what specific logic `work`
actually contains; it only knows it can call `work()` and something
real will run. `RunTwice(() => Console.WriteLine("Tick"));` hands a
lambda directly into that parameter slot, and `RunTwice`'s own body —
calling `work()` twice — is what actually causes `"Tick"` to print
twice, from a method (`RunTwice`) that never mentions `Console.WriteLine`
anywhere in its own source.

### Discard

`RunTwice` is deleted — this is the last throwaway example in this
lesson; the real payoff of this exact shape (a method parameter typed as
a delegate) is what Lesson 07's `event` and Lesson 08's LINQ both build
on directly.

### Mechanical Walkthrough

- `static void RunTwice(Action work)` — **(a) first appearance** of the
  actual point of this unit: a delegate-typed *parameter*, letting
  `RunTwice`'s caller supply the real behavior rather than `RunTwice`
  hardcoding it.
- `work();` (twice) — **(b) hard concept reappearing**, the same
  delegate-call syntax already proven, now calling through a parameter
  instead of a local variable — no difference in mechanism, only in
  where the delegate value came from.
- `RunTwice(() => Console.WriteLine("Tick"));` — **(b) hard concept
  reappearing**, the zero-parameter lambda shape from the previous unit,
  passed directly as an argument rather than assigned to a named
  variable first — proof a lambda doesn't need to be stored in a
  variable at all before being used; it can be written inline, right at
  the call site.

### CS Lens

**(b) hard concept, real restatement.** A method accepting behavior as a
parameter, rather than hardcoding what it does, is the **Strategy
pattern** — the calling code supplies *which* algorithm/behavior runs,
the receiving method supplies *when* and *how often* it runs, and
neither side needs to know the other's internals beyond the shared
delegate shape.

Also recognized in: `List<T>.Sort(Comparison<T>)` and similar
"pass the comparison logic in" APIs across .NET, JavaScript's
`array.forEach(callback)` and `array.map(callback)`, and any
dependency-injection setup where a class receives *how* to do something
as a constructor parameter instead of deciding it internally.

## Connect the pieces

One trace: `Func<>` and `Action<>` are ordinary generic types — no
special syntax, read the same way `List<T>` already is — covering nearly
every method shape without a hand-declared `delegate`. A lambda
satisfies either exactly the way it satisfied Lesson 05's hand-declared
`Operation`. Accepting one as a method *parameter*, as `RunTwice` did, is
the real payoff: a method that runs behavior it was handed, without
knowing or caring what that behavior actually is — the mechanism the
next lesson's `event` and the lesson after that's LINQ both build on
directly.

## What breaks without this

Call `RunTwice` with a lambda whose return type doesn't match `Action`'s
requirement (`void`) — return a value where none is expected:

```csharp
RunTwice(() => { return 5; });
```

This does **not** compile:

```
error CS1662: Cannot convert lambda expression to intended delegate type
because some of the return types in the block don't match the delegate return type
```

Real, provable proof that `Action`'s "no return value" requirement is
checked by the compiler exactly as strictly as `Func<>`'s parameter/
return types were in the previous unit — a lambda's shape has to match
its target delegate type in every respect, not just parameter count.

## Exercises

1. Write a method `static int ApplyTwice(Func<int, int> f, int start)`
   that calls `f` on `start`, then calls `f` again on the result, and
   returns that final value. Call it with a lambda that doubles its
   input, against a starting value of `3`, and confirm the real result.
2. Rewrite this lesson's `RunTwice` to accept an `Action<int>` instead of
   a plain `Action`, calling `work(1)` then `work(2)` inside it. Call it
   with a lambda that prints its parameter, and confirm which two real
   values print.

## Definition of Done

- [ ] You compiled and ran the `Func<>` example and confirmed both real
      results.
- [ ] You compiled and ran the `Action<>` example, including the
      zero-parameter `Action greet` case.
- [ ] You compiled and ran `RunTwice`, confirming `"Tick"` printed twice
      from a method that never mentions `Console.WriteLine` in its own
      source.
- [ ] You caused the real `CS1662` failure and understood why it fires.
- [ ] You completed both exercises and observed the described behavior
      yourself.

## Next

[Lesson 07 — The `event` Keyword](lesson-07-the-event-keyword.md) covers
what changes when a delegate isn't just a method parameter, but a real
class *member* other code can subscribe to and unsubscribe from over
time — the mechanism behind every WPF `Click`, `PropertyChanged`, and
`CollectionChanged` this series' WPF arc will meet.
