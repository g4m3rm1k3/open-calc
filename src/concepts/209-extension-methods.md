---
concept: 209-extension-methods
name: Extension Methods (C#)
---

## Definition

An extension method lets you add new methods to an EXISTING type
(including types you don't own, like built-in `string` or third-party
library types) without modifying that type's original source code or
using inheritance — declared as a static method with `this` before its
first parameter.

## Problem

Adding a useful helper method to a type you don't own (a built-in type
like `string`, or a class from an external library) is normally
impossible — you can't edit their source code, and inheriting just to add
one method is often impractical (especially for sealed classes or value
types). Extension methods let you write instance-method-style calls on
ANY type, as if the method had been part of that type all along, without
ever touching its actual definition.

## Execution

A STATIC method is declared with `this` before its first parameter's
type, marking it as an extension of that type
↓
Calling it is done EXACTLY like a normal instance method, even though
the original type itself was never modified
↓
Behind the scenes, this compiles to an ordinary static method call — the
`this`-prefixed syntax is purely a compile-time convenience for CALLING
it with instance-method syntax
↓
Extension methods are resolved at COMPILE time based on which namespaces
are imported (`using`) — the same method name can exist as different
extensions in different namespaces without conflicting, as long as only
one is in scope at a time

## Computer Science

Extension methods are pure syntactic sugar — the compiler statically
resolves an extension-method call into an ordinary static method call at
COMPILE time; there's no runtime mechanism involved at all, unlike true
polymorphism, which is why extension methods can't be overridden or
participate in virtual dispatch.

Tags: Syntactic sugar, Compile-time resolution, No runtime polymorphism

## Software Engineering

LINQ's own methods (`.Where()`, `.Select()`, etc.) are THEMSELVES
implemented as extension methods on `IEnumerable<T>` — this is the
primary real-world use case extension methods were designed for: adding
a rich, fluent API to an existing interface without needing every
collection type to individually implement dozens of methods.

Tags: LINQ implementation detail, Fluent APIs, IEnumerable extension

## Common Mistakes

- Overusing extension methods for logic that would be clearer as a regular static utility method — extension methods are best reserved for cases where the "called as if it were an instance method" readability genuinely helps, not as a default habit for every helper function.
- Forgetting that an extension method requires its containing static class's namespace to be imported (`using`) wherever it's called — without the right `using` directive, the extension method simply won't be found by the compiler.

## Exercises

- Trace through what the static call form and the extension-method call form of the same method both actually compile down to — are they truly identical at the IL/bytecode level?
- Explain why extension methods can't override or participate in virtual/polymorphic dispatch the way a real instance method defined ON a class can.

## csharp

```csharp
using System;
using System.Linq;

Console.WriteLine("racecar".IsPalindrome());   // True -- called exactly like a normal instance method
Console.WriteLine("hello".IsPalindrome());     // False

// Both syntaxes compile to the exact same underlying call
Console.WriteLine(StringExtensions.IsPalindrome("racecar") == "racecar".IsPalindrome());   // True

public static class StringExtensions
{
    public static bool IsPalindrome(this string s)
    {
        var reversed = new string(s.Reverse().ToArray());
        return s == reversed;
    }
}
```
Walkthrough: `"racecar".IsPalindrome()` is called with ordinary
instance-method syntax on a plain `string`, even though `string` was
never modified — this only works because `StringExtensions.IsPalindrome`
is marked as an extension via `this string s`. The final line confirms
both the explicit static call and the extension-method call syntax
produce IDENTICAL results, since they compile to the exact same
underlying method call.
