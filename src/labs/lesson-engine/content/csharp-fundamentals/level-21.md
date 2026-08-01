---
series: csharp-fundamentals
level: 21
title: Operator Overloading
lang: csharp
---

# Operator Overloading

`+` has meant "add two numbers" and "concatenate two strings" throughout this entire course, silently working differently depending on the types involved. C# lets ordinary classes join that list: **operator overloading** defines what `+`, `==`, and other operators mean for a type you write yourself.

## Overloading +

```csharp
using System;

class Vector2
{
    public double X, Y;

    public Vector2(double x, double y)
    {
        X = x;
        Y = y;
    }

    public static Vector2 operator +(Vector2 a, Vector2 b)
    {
        return new Vector2(a.X + b.X, a.Y + b.Y);
    }

    public override string ToString()
    {
        return "(" + X + ", " + Y + ")";
    }
}

class Program
{
    static void Main()
    {
        var v1 = new Vector2(1, 2);
        var v2 = new Vector2(3, 4);
        var v3 = v1 + v2;

        Console.WriteLine(v3);
    }
}
```

```text
(4, 6)
```

`public static Vector2 operator +(Vector2 a, Vector2 b)` — defines what `+` means between two `Vector2`s. Always `static`, always takes the operands as parameters, always named `operator` followed by the symbol itself.

`v1 + v2` — with the overload in place, this reads exactly like adding two numbers, and really does call the method above, returning a genuinely new `Vector2(4, 6)`.

`public override string ToString()` — **overrides** a method every class already has, inherited from `object` (every class in C# ultimately inherits from `object`, whether written explicitly or not). `Console.WriteLine(v3)` calls `v3.ToString()` internally to decide what to print — overriding it is what turns the default, unhelpful printout into `"(4, 6)"`.

**CS lens:** Operator overloading doesn't add new operators to C# — it only lets a type define what an *existing* operator means for its own instances. `Vector2 + Vector2` is legal only because `Vector2` itself defined it; `Vector2 + string` would still be a compile error, since no `operator +` matching that combination exists.

## Overloading == Correctly

```csharp
using System;

class Money
{
    public int Cents;

    public Money(int cents) { Cents = cents; }

    public static bool operator ==(Money a, Money b)
    {
        return a.Cents == b.Cents;
    }

    public static bool operator !=(Money a, Money b)
    {
        return !(a == b);
    }

    public override bool Equals(object obj)
    {
        if (obj is Money m) return this.Cents == m.Cents;
        return false;
    }

    public override int GetHashCode()
    {
        return Cents.GetHashCode();
    }
}

class Program
{
    static void Main()
    {
        var m1 = new Money(150);
        var m2 = new Money(150);
        var m3 = new Money(200);

        Console.WriteLine(m1 == m2);
        Console.WriteLine(m1 == m3);
        Console.WriteLine(m1 != m3);
    }
}
```

```text
True
False
True
```

`public static bool operator ==(Money a, Money b)` — without this, `Money` is a `class` (Level 5's own reference type rules), and `==` would compare *identity* — whether `a` and `b` are literally the same object — not whether their `Cents` match. Overloading `==` here makes `m1 == m2` compare contents instead, the same way `string`'s own `==` already does (Level 4).

`public static bool operator !=(Money a, Money b)` — C# requires `==` and `!=` to be overloaded **together**, as a real, enforced pair; defining one without the other is a compile error.

`public override bool Equals(object obj)` / `public override int GetHashCode()` — real .NET conventions expect any type overloading `==` to also override these two, kept consistent with it — `Dictionary<Money, ...>` and LINQ's own equality-based operators (like `Distinct()`) use `Equals`/`GetHashCode`, not `==`, internally.

**SE lens:** Operator overloading is genuinely useful for types that represent a real value — a vector, a currency amount, a complex number — where `+`/`==` have an obvious, unambiguous mathematical meaning. Overloading `+` on a type where "adding two of them" isn't actually obvious is a real, common misuse — the operator should read naturally, not require a comment explaining what it secretly does.

## Challenge: fraction_add

Write a `Fraction` class with:
- `public int Numerator` and `public int Denominator` fields
- A constructor `Fraction(int numerator, int denominator)`
- `public static Fraction operator +(Fraction a, Fraction b)` returning a new `Fraction` with numerator `a.Numerator * b.Denominator + b.Numerator * a.Denominator` and denominator `a.Denominator * b.Denominator` (do not simplify the result)

```challenge
class Fraction
{
    // TODO
}
```

```test
var half = new Fraction(1, 2);
var quarter = new Fraction(1, 4);
var sum = half + quarter;
assert sum.Numerator == 6
assert sum.Denominator == 8
var oneThird = new Fraction(1, 3);
var twoThirds = new Fraction(2, 3);
var sum2 = oneThird + twoThirds;
assert sum2.Numerator == 9
assert sum2.Denominator == 9
```
