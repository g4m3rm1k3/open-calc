---
series: csharp-fundamentals
level: 14
title: Delegates & Lambdas
lang: csharp
---

# Delegates & Lambdas

Every variable so far has held data — a number, a string, an object. A **delegate** is a type whose values are *methods* — a variable that holds a method, callable through that variable, and reassignable to a completely different method later. This lesson builds one from scratch, then introduces the shorthand — **lambda expressions** — that make delegates practical to use everywhere, including the LINQ syntax the next lesson relies on directly.

## Declaring and Using a Delegate

```csharp
using System;

delegate int Operation(int a, int b);

class Program
{
    static int Add(int a, int b) { return a + b; }
    static int Multiply(int a, int b) { return a * b; }

    static void Main()
    {
        Operation op = Add;
        Console.WriteLine(op(3, 4));

        op = Multiply;
        Console.WriteLine(op(3, 4));
    }
}
```

```text
7
12
```

`delegate int Operation(int a, int b);` — declares a new type, `Operation`, describing "any method taking two `int`s and returning an `int`." Not a specific method — a shape any matching method can fill.

`Operation op = Add;` — assigns the method `Add` itself to `op`, by name, with no parentheses (parentheses would *call* it immediately instead).

`op(3, 4)` — calling `op` like an ordinary method actually runs whatever method it currently holds.

`op = Multiply;` — reassigns `op` to a completely different method. The same variable, the same call syntax (`op(3, 4)`), now runs different code.

**CS lens:** A delegate is C#'s version of a **first-class function** — a method treated as a value, storable in a variable, passable as an argument, exactly like any `int` or `string`.

## Func, Action, and Predicate — Built-In Generic Delegates

Writing a new `delegate` type for every possible method shape would be tedious. .NET provides three generic ones covering almost every case:

```csharp
using System;

class Program
{
    static void Main()
    {
        Func<int, int, int> add = delegate(int a, int b) { return a + b; };
        Console.WriteLine(add(3, 4));

        Func<int, int> square = x => x * x;
        Console.WriteLine(square(5));

        Action<string> greet = name => Console.WriteLine("Hello, " + name);
        greet("Alice");

        Predicate<int> isEven = n => n % 2 == 0;
        Console.WriteLine(isEven(4));
        Console.WriteLine(isEven(5));
    }
}
```

```text
7
25
Hello, Alice
True
False
```

`Func<int, int, int>` — a delegate type taking two `int` parameters and returning an `int`. `Func`'s last type parameter is always the return type; every one before it is a parameter type.

`delegate(int a, int b) { return a + b; }` — an **anonymous method**: a method with no name, written directly where a delegate value is needed.

`x => x * x` — a **lambda expression**: the same idea as an anonymous method, in shorter syntax. `x` is the parameter (its type, `int`, is inferred from `Func<int, int>`); `x * x` is the expression the lambda evaluates to and returns — no `return` keyword needed for a single-expression lambda.

`Action<string>` — like `Func`, but for a delegate that returns nothing (`void`). Every type parameter is a parameter type; there is no separate return-type slot.

`Predicate<int>` — shorthand specifically for "takes one value, returns `bool`" — exactly the shape a filtering condition needs.

**SE lens:** `Func`/`Action`/`Predicate` cover the overwhelming majority of real delegate needs, which is why a hand-written `delegate` type (this lesson's first example) is comparatively rare in real code — reach for one specifically when the *name* itself documents something a generic `Func<int, int, int>` doesn't ("this is an `Operation`," not just "some function of two ints").

## Lambdas Can Capture Variables From Their Surroundings

```csharp
using System;

class Program
{
    static void Main()
    {
        int threshold = 10;
        Func<int, bool> isAboveThreshold = x => x > threshold;

        Console.WriteLine(isAboveThreshold(15));
        Console.WriteLine(isAboveThreshold(5));
    }
}
```

```text
True
False
```

`x => x > threshold` — `threshold` is not a parameter of the lambda; it's a variable from the enclosing method, read directly inside the lambda body. This is called a **closure**: the lambda "closes over" `threshold`, keeping access to it even though `threshold` was declared outside the lambda's own parameter list.

## Passing a Lambda as an Argument

```csharp
using System;

class Program
{
    static int ApplyTwice(Func<int, int> f, int x)
    {
        return f(f(x));
    }

    static void Main()
    {
        Console.WriteLine(ApplyTwice(n => n * 2, 3));
        Console.WriteLine(ApplyTwice(n => n + 10, 5));
    }
}
```

```text
12
25
```

`ApplyTwice(Func<int, int> f, int x)` — a method whose first parameter is itself a delegate — `ApplyTwice` doesn't know or care *what* `f` actually does, only that it's some `int → int` function, applied twice.

`ApplyTwice(n => n * 2, 3)` — passes a lambda directly as the argument, with no separate named method ever declared. `f(f(3))` becomes `double(double(3))` — `3 → 6 → 12`.

**CS lens:** A method that takes another method as a parameter — `ApplyTwice` here — is called a **higher-order function**. `Where`/`Select`, the next lesson's own subject, are exactly this: ordinary methods that happen to take a delegate (a lambda, almost always) telling them what to do with each element.

## Challenge: apply_to_all

Write a `static List<int> ApplyToAll(List<int> numbers, Func<int, int> transform)` method that returns a new list containing `transform` applied to every element of `numbers`, in order. Build the result with a plain `for` loop — do not use LINQ yet.

```challenge
static List<int> ApplyToAll(List<int> numbers, Func<int, int> transform)
{
    // TODO
}
```

```test
var doubled = ApplyToAll(new List<int> { 1, 2, 3 }, n => n * 2);
assert doubled.Count == 3
assert doubled[0] == 2 && doubled[1] == 4 && doubled[2] == 6
var squared = ApplyToAll(new List<int> { 2, 3, 4 }, n => n * n);
assert squared[0] == 4 && squared[1] == 9 && squared[2] == 16
assert ApplyToAll(new List<int>(), n => n + 1).Count == 0
```
