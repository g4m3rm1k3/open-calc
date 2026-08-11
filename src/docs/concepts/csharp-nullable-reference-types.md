# Concept: Nullable Reference Types (`string?`, `<Nullable>enable</Nullable>`)

**What you'll understand by the end:** what turning on `<Nullable>enable</Nullable>` actually changes about how the compiler treats every reference-typed variable, what the `?` suffix on a type (`string?`, `Action?`, `T?`) really means, and why this is a completely different mechanism from the null-conditional operator `?.`.

**Prerequisites:** `csharp-classes-objects-and-fields.md`.

## Setup

```
dotnet new console -o lab-nullable
cd lab-nullable
```

Replace the generated `Program.cs`'s contents with the example below. The template's own `.csproj` already contains `<Nullable>enable</Nullable>` — leave it as-is for the second and third runs; the first run below temporarily changes it to `<Nullable>disable</Nullable>` to show the baseline it's being compared against.

## The Problem

A variable of a reference type (`string`, or any `class`) can, by default, hold either a real object or the special value `null` — the type system makes no distinction between the two cases. Calling a method or reading a property on a variable that turns out to be `null` throws a `NullReferenceException` at runtime — one of the single most common crashes in any C#, Java, or similar statically-typed object-oriented codebase. The type checker sees `string category` and `string? maybeCategory` as identically capable of holding a real value; nothing about the *type itself* tells you, or the compiler, which variables are actually allowed to be empty and which ones the rest of the code is relying on always being set.

## The Isolated Example

**First, with `<Nullable>disable</Nullable>` set in the `.csproj`** (the traditional, pre-C#-8 behavior):

```csharp
string category = "Tools";
category = null;
Console.WriteLine($"Category length: {category.Length}");
```

**Real output — `dotnet build`:**
```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

**Real output — `dotnet run`:**
```
Unhandled exception. System.NullReferenceException: Object reference not set to an instance of an object.
   at Program.<Main>$(String[] args) in ...\Program.cs:line 3
```

**What this proves:** with nullable checking off, assigning `null` to a plain `string` is completely invisible to the compiler — a clean build, zero warnings — and the mistake only surfaces the moment the program actually runs and tries to use the missing value. The type `string` gave no information at all about whether `null` was a legitimate value here.

**Now switch the `.csproj` back to `<Nullable>enable</Nullable>`** and rebuild the exact same code, unchanged:

**Real output — `dotnet build`:**
```
Program.cs(2,12): warning CS8600: Converting null literal or possible null value to non-nullable type.
Program.cs(3,39): warning CS8602: Dereference of a possibly null reference.
Build succeeded.
```

**What this proves:** with nullable reference types turned on, the exact same code that compiled silently before now produces two real, specific compiler warnings — `CS8600` on the line assigning `null` to a variable declared `string` (a type that, under this feature, now means "always a real value"), and `CS8602` on the line reading `.Length` from something the compiler has tracked as possibly `null` at that point. Both are still only warnings — the program still builds and would still crash the same way — but the compiler is now actively telling you where it thinks you have a gap, instead of staying silent until a user hits it at runtime.

**Fix it by declaring intent explicitly:**

```csharp
string? category = "Tools";
category = null;

if (category != null)
{
    Console.WriteLine($"Category length: {category.Length}");
}
else
{
    Console.WriteLine("No category set.");
}
```

**Real output — `dotnet build`:** `0 Warning(s)`, `0 Error(s)`.
**Real output — `dotnet run`:** `No category set.`

**What this proves:** `string?` (a nullable reference type) tells the compiler "this variable is genuinely allowed to be null" — assigning `null` to it produces no warning at all, because that's now a documented, expected possibility, not a mistake. The `if (category != null)` check is what actually silences the `CS8602` dereference warning: once the compiler can see, in that exact code path, that `category` can't be `null` past this point, reading `.Length` inside the `if` block is provably safe, and outside it (the `else` branch) the code doesn't try to touch `.Length` at all.

## Mechanical Walkthrough

- `<Nullable>enable</Nullable>` — a setting in the `.csproj` file, not a language keyword. It turns on the compiler's **nullable annotation context** and **nullable warning context** together for the whole project: every reference type written without a `?` is now treated as *non-nullable* (the compiler assumes, and warns if it can't prove, that it's never `null`), and every reference type written with a `?` is *nullable* (explicitly allowed to be `null`, and the compiler tracks that possibility through the code that follows it).
- `string` (no `?`) — under nullable-enabled code, this means "a `string` that the compiler expects to always hold a real value." Assigning `null` to it, or letting a path exist where it might end up `null`, produces a warning — `CS8600` here.
- `string?` — the same underlying type, `string`, with an explicit `?` suffix marking it as nullable. This is a compile-time annotation only; at runtime, `string` and `string?` are the exact same type (`System.String`) and compile to identical IL — nothing about the actual variable's storage or behavior changes. The `?` exists purely so the compiler's static analysis can track, and warn about, where `null` is and isn't expected.
- `category.Length` (unguarded) — reading a member off a variable the compiler is currently tracking as "possibly null at this point" produces `CS8602`, a **possible-null-dereference warning**, distinct from `CS8600`'s assignment-time warning.
- `if (category != null) { ... }` — an ordinary `if` check, but the nullable-aware compiler does real **flow analysis** on it: inside the `true` branch, it narrows its own understanding of `category`'s nullability to "definitely not null here," which is why `category.Length` inside that block produces no warning even though the same expression, unguarded, did moments earlier.

## CS Lens

This is a lightweight form of **static null-safety analysis** — using the type system itself to track a property (*"can this be absent?"*) that would otherwise only be discoverable by actually running the code and hitting the failure. It does not eliminate `null` from C# the way some languages eliminate it entirely (there is no way to make the compiler refuse to compile a real, provable null dereference — every `CS86xx` code here is a *warning*, not an error, unless a project explicitly configures warnings as errors); it makes the *absence of a value* something the type system can flag early, at the exact line where the risk was introduced, instead of leaving every reference silently, uniformly "maybe null."

Also recognized in: Kotlin's non-null-by-default types (`String` vs. `String?`, enforced far more strictly — genuinely a compile error, not just a warning); TypeScript's `strictNullChecks` (`string` vs. `string | null`); Swift's `Optional<T>` (`String` vs. `String?`); Rust's `Option<T>`, which goes further still and makes "the value might be absent" a real, distinct type the code is forced to unwrap explicitly before every use. All of these are the same underlying idea — stop treating "has a value" and "might not" as the same type — arrived at through different enforcement strength.

## SE Lens

The alternative — leaving nullable checking off, as every C# codebase written before C# 8 effectively had to — means every reference-typed variable in the entire program is silently, uniformly "maybe null," all the time, with no way to tell from a type alone which ones actually need a null check before use and which ones never realistically will. That pushes the entire burden onto either defensive `if (x != null)` checks scattered everywhere "just in case," or trusting memory and documentation about which variables are safe — both of which fail silently the moment someone new touches the code, or a code path changes years later. Nullable reference types don't remove the need for real null checks; they make the compiler an active participant in telling you *exactly* where one is missing, at the specific line that introduced the gap, rather than leaving that discovery to whichever user happens to trigger it first in production. The real cost: retrofitting this onto a large, pre-existing codebase that was written assuming everything might be `null` produces a wave of warnings that have to be triaged one at a time — turning it on is nearly free on a brand-new project, and genuinely, honestly effortful on an old one.

## Connection

This underlies every `T?`, `string?`, `Action?`, or nullable event-field declaration (`public event Action? DoorOpened;`) seen anywhere reference types are used alongside `<Nullable>enable</Nullable>` — the `?` is doing the exact same job in every one of those cases: marking that specific reference as allowed to be absent. It is a genuinely different mechanism from the **null-conditional operator** (`x?.Member`), which is a runtime short-circuiting operator ("read `.Member` only if `x` isn't null, otherwise produce `null` and skip it") that exists independently of whether nullable reference types are turned on at all — the two are easy to conflate because they share the `?` character, but one is a compile-time-only annotation on a *type*, and the other is a runtime-affecting operator used at an *expression*.

## Try It Yourself

1. Remove the `if (category != null)` guard entirely and call `category.Length` directly on a `string?` variable. Confirm the compiler produces `CS8602` again — declaring something nullable doesn't excuse checking it; it's the opposite, it's what makes the compiler start expecting a check.
2. Write a method `int GetLength(string? input)` that returns `0` when `input` is `null` and `input.Length` otherwise, using the null-conditional and null-coalescing operators together: `return input?.Length ?? 0;`. Confirm it compiles with zero warnings, and reason about why — `?.` short-circuits to `null` instead of throwing, and `??` supplies the fallback, so the compiler can prove `.Length` is never actually read on a null reference.
3. Declare a field `public string Name = "";` (non-nullable, with a default empty-string value) versus `public string? Name;` (nullable, defaults to `null`) inside a small class, and confirm only the second one lets you assign `null` back to `Name` later without a warning — the annotation is part of the *declaration*, not something decided per-assignment.
