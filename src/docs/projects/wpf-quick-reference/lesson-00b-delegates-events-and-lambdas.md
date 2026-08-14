# Lesson 00b: Delegates, Events, and Lambdas

**What this covers:** the one C# mechanism with no direct Java/Kotlin
equivalent, and the reason it matters here: `Button.Click`, data-binding
change notifications, and `ICommand` (Lesson 07) are all the exact same
mechanism underneath. Understand this once and three later lessons stop
looking like separate magic tricks.

**What you need to know first:** [Lesson 00](lesson-00-csharp-for-java-kotlin-developers.md).
Java/Kotlin background — specifically, how Java hands a behavior to
another object (an anonymous class implementing an interface, e.g. a
`Runnable` or an `OnClickListener`) — is useful context for what this
lesson replaces.

## The problem

In Java/Android, "run this code later, when something happens" means
implementing an interface with one method — `View.OnClickListener` with
its single `onClick`. C# has that pattern too (interfaces work the same
way you already know), but it also has a lighter-weight mechanism built
directly into the language for exactly this one job: passing a *method
itself* around as a value, the way you'd pass an `int` or a `string`.

## A delegate is a typed reference to a method

```csharp
delegate int Operation(int a, int b);

class Calculator
{
    public static int Add(int a, int b) => a + b;
    public static int Multiply(int a, int b) => a * b;
}

Operation op = Calculator.Add;
Console.WriteLine(op(3, 4));   // 7

op = Calculator.Multiply;
Console.WriteLine(op(3, 4));   // 12
```

`delegate int Operation(int a, int b);` declares a **type** — not a
method, a type — describing "any method that takes two `int`s and returns
an `int`." `Operation op = Calculator.Add;` doesn't call `Add`; it stores
a reference to the method itself in `op`, the same way `int x = 5;`
stores a value in `x`. `op(3, 4)` then calls whichever method `op`
currently points at. This is real, provable — swapping `op` from `Add` to
`Multiply` and calling it the exact same way, with the exact same call
syntax, changes what runs.

**Why this doesn't exist as a named concept in Java:** Java has no
first-class function type — passing "a method" around requires wrapping
it in an object that implements a single-method interface (a functional
interface, `Runnable`, `Comparator`, etc.). A C# delegate *is* that method
reference directly, no wrapping interface required. Kotlin is closer —
its function types (`(Int, Int) -> Int`) are closer cousins of a
delegate than Java's are.

## Lambda expressions — an unnamed method written inline

Writing a whole named method just to hand it to a delegate is usually
overkill. A **lambda expression** writes the method body inline, with no
name:

```csharp
Operation add = (a, b) => a + b;
Console.WriteLine(add(3, 4));  // 7

Operation subtract = (int a, int b) => { return a - b; };
Console.WriteLine(subtract(10, 4)); // 6
```

`(a, b) => a + b` — the **lambda operator** `=>` separates the parameter
list on the left from the body on the right. `(a, b) => a + b` is
shorthand for "a method taking `a` and `b`, whose body is `return a + b;`"
— the parameter types are inferred from `Operation`'s own declared
signature, so they don't need to be written again. The second form,
`(int a, int b) => { return a - b; }`, is the same thing with explicit
types and a full `{ }` block body — needed once the body is more than one
expression. This is the exact same `=>` you saw on `get => _name;` in
Lesson 00 — same operator, same "here's a short inline definition" idea,
applied to a full standalone function here instead of one property
accessor.

## `Func<>` and `Action<>` — delegates you don't have to declare yourself

Declaring a `delegate` type by hand, like `Operation` above, is real but
rare in day-to-day C#. .NET ships two generic delegate types that cover
almost every case:

```csharp
Func<int, int, int> add = (a, b) => a + b;   // takes int, int; returns int
Action<string> log = msg => Console.WriteLine(msg); // takes string; returns nothing

Console.WriteLine(add(3, 4));  // 7
log("hello");                   // prints "hello"
```

`Func<T1, T2, TResult>` — a generic delegate type whose *last* type
parameter is always the return type, and everything before it is the
parameter list, in order. `Action<T>` is the same idea for a method that
returns nothing (`void`) — same generic-parameter idea as Java's/Kotlin's
own generics (`List<T>`), applied to a function's shape instead of a
container's contents. `msg => Console.WriteLine(msg)` — a single-parameter
lambda drops the parentheses around the parameter list; `(msg) => ...`
and `msg => ...` are identical.

You already met this exact pattern in Lesson 00's LINQ section:
`items.Where(i => i.Value > 100)` — `Where` takes a
`Func<Item, bool>` parameter, and `i => i.Value > 100` is a lambda
satisfying it. Nothing new there was ever explained as "a delegate" by
name until now; it's the same mechanism.

## `event` — a delegate a class can only fire itself, never overwrite

A plain delegate field has a real problem for anything resembling
"notify me when X happens": any outside code can do `op = SomethingElse;`
and silently replace every previously registered handler instead of
adding to them. The `event` keyword narrows what outside code is allowed
to do with a delegate field down to exactly `+=`/`-=` — register or
unregister — never replace:

```csharp
public class Doorbell
{
    public event Action? Pressed;

    public void Press()
    {
        Console.WriteLine("Button physically pressed.");
        Pressed?.Invoke();
    }
}

class Program
{
    static void Main()
    {
        var doorbell = new Doorbell();
        doorbell.Pressed += () => Console.WriteLine("Chime rings!");
        doorbell.Pressed += () => Console.WriteLine("Light flashes!");

        doorbell.Press();
    }
}
```

**Real output:**
```
Button physically pressed.
Chime rings!
Light flashes!
```

`public event Action? Pressed;` — `Action` (no type parameters) is a
delegate taking no arguments and returning nothing; the `?` makes it
nullable (Lesson 00), because before anyone subscribes, it genuinely is
`null`. `event` in front of it is what restricts outside code to
`+=`/`-=` only — `doorbell.Pressed = something;` from outside the class
is a compile error, on purpose. `doorbell.Pressed += () => ...;` —
**subscribing**: `+=` adds this lambda to the list of methods `Pressed`
will call, without removing whatever was already subscribed — this is why
both messages printed, in the order they were added. `Pressed?.Invoke();`
— inside `Doorbell` itself (where plain delegate access, not just
`+=`/`-=`, is still allowed), `?.` is the **null-conditional operator**:
"call `Invoke()` only if `Pressed` isn't `null`" — skips the call entirely
if nobody ever subscribed, instead of throwing.

**This is `Button.Click` in WPF, exactly.** `Button` internally has
`public event RoutedEventHandler Click;` (its real event's actual
delegate type, `RoutedEventHandler`, is `(object sender, RoutedEventArgs e)`
shaped — covered in Lesson 05). Writing `myButton.Click += MyButton_Click;`
in a WPF code-behind file — which every generated project already does —
is subscribing to that event, the identical mechanism as
`doorbell.Pressed += ...` above, just spelled with a named method instead
of an inline lambda.

## CS Lens

This is the **Observer pattern**: `Doorbell` (the subject) doesn't know
or care what `Pressed` subscribers actually do — it just calls whatever's
registered when the real-world event happens. Subscribers react; the
subject never reaches out and asks them anything.

Also recognized in: every GUI framework's event handlers (WPF's own
`Click`, Android's `OnClickListener`, a browser's `addEventListener`),
`INotifyPropertyChanged.PropertyChanged` (Lesson 06 — a WPF binding
literally subscribes to this event to know when to refresh), and any
publish/subscribe messaging system at a larger scale.

## Connect the pieces

`delegate` declares a callable shape → a **lambda** (`=>`) is the fastest
way to write one → `Func<>`/`Action<>` are the pre-built delegate types
that cover almost every real case, including LINQ's own methods → `event`
is a delegate field hardened so outside code can only subscribe, never
overwrite → `Button.Click += Handler;`, `PropertyChanged`, and `ICommand`
(Lesson 07) are all this same mechanism wearing a WPF-specific name.

## Next

[Lesson 01 — Anatomy of a WPF Project](lesson-01-anatomy-of-a-wpf-project.md)
starts the WPF track for real: what `dotnet new wpf` generates, and what
each generated file actually is.
