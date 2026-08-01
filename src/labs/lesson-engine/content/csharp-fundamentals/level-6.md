---
series: csharp-fundamentals
level: 6
title: Access Modifiers & Namespaces
lang: csharp
---

# Access Modifiers & Namespaces

`using System;` has appeared at the top of every single example so far, and `public`/`private` have already been used on class members without ever being properly named. This lesson defines both directly: **access modifiers** control who can see a piece of code, and **namespaces** organize code so two unrelated pieces can share a name without colliding.

## public and private

```csharp
using System;

class Account
{
    public string Owner;
    private double _balance;

    public Account(string owner, double balance)
    {
        Owner = owner;
        _balance = balance;
    }

    public double GetBalance()
    {
        return _balance;
    }
}

class Program
{
    static void Main()
    {
        Account a = new Account("Alice", 100.0);
        Console.WriteLine(a.Owner);
        Console.WriteLine(a.GetBalance());
    }
}
```

```text
Alice
100
```

`public string Owner;` — reachable from any code, anywhere, including `Program`, a completely different class. `a.Owner` reads it directly.

`private double _balance;` — reachable only from inside `Account` itself. `Program` cannot write `a._balance` — that line would fail to compile. The only way `Program` can ever learn the balance is through `GetBalance()`, a `public` method `Account` itself chose to expose.

**SE lens:** This is the real, concrete meaning of **encapsulation**: `Account` decides exactly what the outside world can see and touch. Making `_balance` `private` and exposing it only through a method means `Account` could later add validation, logging, or a completely different internal representation to `GetBalance()` without breaking any code that calls it — the same guarantee properties (a later lesson) build on top of this exact mechanism.

## The Default Is private

```csharp
class Widget
{
    int _count;

    void Reset()
    {
        _count = 0;
    }
}
```

`int _count;` and `void Reset()` — no modifier written at all. Inside a `class`, no modifier defaults to `private`. This has been true in every example since Level 0 — `Main` itself has always been `static void Main()`, never explicitly `private`, and has always been unreachable from outside its own class as a direct consequence.

## protected — Visible to Derived Classes Too

```csharp
using System;

class Base
{
    protected int protectedValue = 10;
    private int privateValue = 20;
}

class Derived : Base
{
    public int ReadProtected()
    {
        return protectedValue;
    }
}

class Program
{
    static void Main()
    {
        Derived d = new Derived();
        Console.WriteLine(d.ReadProtected());
    }
}
```

```text
10
```

**Out of scope for now:** `class Derived : Base` — one class extending another — gets its own full lesson soon; it's used here only to show what `protected` actually unlocks.

`protected int protectedValue = 10;` — invisible from outside the class hierarchy, exactly like `private`, but *visible* to `Derived` — proven directly: `ReadProtected()`, defined on `Derived`, reads `protectedValue` successfully. `privateValue`, by contrast, would not compile if `Derived` tried to read it — `private` means "this class only," full stop, with no exception for anything that extends it.

## Namespaces — Organizing Code, Avoiding Collisions

```csharp
namespace Shapes
{
    class Circle
    {
        public double Radius;
    }
}

namespace Program
{
    using Shapes;
    using System;

    class Runner
    {
        static void Main()
        {
            Circle c = new Circle();
            c.Radius = 5.0;
            Console.WriteLine(c.Radius);
        }
    }
}
```

```text
5
```

`namespace Shapes { ... }` — groups everything inside it under the name `Shapes`. `Circle`'s real, full name is actually `Shapes.Circle`, not just `Circle`.

`using Shapes;` — imports everything inside the `Shapes` namespace, so `Circle` can be written directly instead of the fully-qualified `Shapes.Circle`. This is the exact same mechanism as `using System;`, present since Level 0 — `System` is itself just a namespace, and `Console` is really `System.Console`.

**CS lens:** Namespaces exist specifically so two unrelated libraries can each define a class named, say, `Timer`, without conflicting — `Shapes.Circle` and some other, unrelated `Physics.Circle` can coexist in the same program, distinguished by their full names, even though both are informally just "Circle" to a reader who already knows which `using` is in effect.

## Challenge: can_access

Write a `static bool CanAccess(string modifier, bool isSameClass, bool isDerivedClass)` method that returns whether code with the given relationship can access a member with the given modifier:
- `"public"` → always `true`.
- `"private"` → `true` only if `isSameClass` is `true`.
- `"protected"` → `true` if `isSameClass` or `isDerivedClass` is `true`.
- Any other modifier string → `false`.

```challenge
static bool CanAccess(string modifier, bool isSameClass, bool isDerivedClass)
{
    // TODO
}
```

```test
assert CanAccess("public", false, false) == true
assert CanAccess("private", true, false) == true
assert CanAccess("private", false, true) == false
assert CanAccess("protected", false, true) == true
assert CanAccess("protected", false, false) == false
assert CanAccess("internal", false, false) == false
```
