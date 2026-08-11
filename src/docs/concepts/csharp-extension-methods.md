# Concept: Extension Methods (`this` on a Method's First Parameter)

**What you'll understand by the end:** how to add a method that's callable with ordinary dot syntax on a type you don't own the source of and cannot inherit from, why this is necessary at all (some types explicitly forbid inheritance), and why an extension method can never reach a type's private internals the way a real instance method could.

**Prerequisites:** `csharp-classes-objects-and-fields.md`, `csharp-inheritance.md`.

## Setup

```
dotnet new console -o lab-extension
cd lab-extension
```
Replace the generated `Program.cs`'s contents with each example below in turn.

## The Problem

Sometimes a type that's already in constant use is missing a method that would be genuinely convenient to call on it directly — but that type's own source code isn't something a program can edit, and inheritance (the ordinary tool for adding behavior to a type) might not even be an option.

## The Isolated Example

`string` has no built-in method for "is this string written entirely in uppercase." The obvious first idea — inherit from `string` and add one:
```csharp
class LoudString : string
{
}
```

**Real, captured failure — `dotnet run`:**
```
Program.cs(1,20): error CS0509: 'LoudString': cannot derive from sealed type 'string'
```

**What this proves:** `string` is marked `sealed` — no class may ever inherit from it, for any reason, confirmed directly by the compiler refusing even this simplest possible attempt. Inheritance, the ordinary tool for adding behavior to a type, is closed off here entirely.

**Now the real fix — an extension method:**
```csharp
string loud = "STOP";
string quiet = "Stop";

Console.WriteLine($"'{loud}'.IsShouting(): {loud.IsShouting()}");
Console.WriteLine($"'{quiet}'.IsShouting(): {quiet.IsShouting()}");

static class StringExtensions
{
    public static bool IsShouting(this string value)
    {
        return value == value.ToUpper();
    }
}
```

**Real output:**
```
'STOP'.IsShouting(): True
'Stop'.IsShouting(): False
```

#### Execution Trace

1. `loud.IsShouting()` — called with ordinary dot syntax, exactly like a real instance method, on a plain `string`.
2. C# resolves `IsShouting` to `StringExtensions.IsShouting(this string value)`, passing `loud` itself as `value` — `"STOP" == "STOP".ToUpper()` is `"STOP" == "STOP"`, `true`.
3. `quiet.IsShouting()` — the same resolution, `value` is `"Stop"` this time — `"Stop" == "STOP"` is `false`.

**What this proves:** `IsShouting`, declared as a `static` method taking a `this string value` first parameter, becomes callable as `anyString.IsShouting()` — real, working syntax that looks exactly like a genuine instance method, on a type (`string`) that flatly refuses inheritance. This is called an **extension method**.

## Mechanical Walkthrough

- Attempting `: string` on a class declaration — proven by the real `CS0509` error — `string` explicitly forbids exactly what ordinary inheritance would otherwise allow.
- `static class StringExtensions` — an extension method must live inside a `static` class: a class that's never instantiated, only ever a container for `static` methods.
- `public static bool IsShouting(this string value)` — the `this` here is not the familiar "the current object" keyword; on a method's *first parameter specifically*, it means "make this method callable as if it belonged to whatever type follows."
- `loud.IsShouting()` — ordinary method-call syntax, resolving to a `static` method the compiler rewrites, behind the scenes, into `StringExtensions.IsShouting(loud)`.

## CS Lens

An extension method never actually becomes part of the type it extends — `string` itself is completely unchanged; `IsShouting` doesn't exist inside `string`'s own real definition, only inside `StringExtensions`, made *visible* as if it did through nothing more than the `this` parameter and the compiler's own call-syntax rewriting. This is why extension methods can never access a type's private internals the way a real instance method could — they only ever see what's already public, because underneath, they really are just an ordinary `static` method call with special call-site syntax.

Also recognized in: Kotlin's extension functions (`fun String.isShouting(): Boolean`, the identical idea with the receiver type written first instead of a `this`-marked parameter); Swift's `extension` declarations, which go further and allow adding computed properties too, not just methods; C++ has no direct equivalent, which is part of why free functions taking the "extended" type as their first argument are idiomatic there instead.

## SE Lens

Why not just write a plain `static` method, `IsShouting(value)`, skipping the `this` parameter entirely? Both compile to identical behavior at runtime — the difference is purely about how the call reads at the point of use. `value.IsShouting()` reads as "a property of this value," placing the check right where the value itself already sits in the code, the same left-to-right flow `value.Length` or `value.ToUpper()` already have; `IsShouting(value)` reads as "some external operation applied to a value," burying the actual subject inside a parameter list. The real cost of reaching for an extension method too often: it can make a type look like it has far more built-in behavior than it actually does, since the call site gives no visual signal that a method is coming from somewhere else entirely, not from the type's own real definition.

## Connection

Any large collection-processing library that appears to add dozens of new methods onto a plain sequence or list type — filtering, transforming, aggregating — without that type ever being reopened or subclassed, is built on exactly this mechanism: a `static` class full of methods, each taking `this` on the type being "extended."

## Try It Yourself

1. Write a second extension method, `IsBlank(this string value)`, using `string.IsNullOrWhiteSpace(value)`. Confirm real output for both a blank and a non-blank string.
2. Try calling `StringExtensions.IsShouting(loud)` directly, using the class name instead of dot syntax on `loud` itself. Confirm it produces the identical result — proof the dot-syntax call really is just sugar over an ordinary static call.
3. Add a private field to a small class you write yourself, then write an extension method attempting to read that private field from outside the class. Confirm it fails to compile, and explain, in your own words, why an extension method can't do what a real instance method declared inside the class could.
