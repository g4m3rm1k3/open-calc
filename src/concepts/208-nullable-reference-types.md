---
concept: 208-nullable-reference-types
name: Nullable Reference Types (C#)
---

## Definition

Nullable reference types (enabled via `#nullable enable`) let the C#
compiler track, at compile time, whether a reference-type variable is
allowed to be `null` — a plain `string` is treated as NON-nullable (the
compiler warns if it might be null), while `string?` explicitly marks a
variable as ALLOWED to be null, requiring an explicit null-check before
safe use.

## Problem

In classic C#, EVERY reference type could always be `null`, with no
compile-time distinction between "this is guaranteed to have a value" and
"this might be null" — leading to `NullReferenceException` crashes at
runtime whenever a null check was forgotten. Nullable reference types
make that distinction explicit in the TYPE SYSTEM, letting the compiler
warn about likely null-dereference bugs before the program ever runs.

## Execution

Enabling nullable reference type analysis turns on this tracking for a
file
↓
A plain, non-nullable `string` is assumed ALWAYS safe to use without a
null check
↓
A NULLABLE `string`, explicitly marked with `?`, is one the compiler now
expects code using it to CHECK for null first
↓
Using it directly without a check emits a compiler WARNING (not a hard
error) — "possible null reference," since it might genuinely be null
↓
After an explicit `if (x != null)` check, the compiler's flow analysis
recognizes the variable is definitely non-null INSIDE that block, and the
warning disappears

## Computer Science

This is compile-time flow analysis, not a runtime enforcement mechanism —
nullable reference type warnings can be IGNORED (the code still compiles
and runs, potentially crashing later with a real `NullReferenceException`),
unlike Rust's `Option<T>` or Java's checked exceptions, which the
compiler more strictly enforces; C#'s nullable annotations are a strong
HINT system, not an absolute guarantee.

Tags: Compile-time flow analysis, Warnings not errors, Opt-in null safety

## Software Engineering

Because nullable reference type warnings are just warnings, not compile
errors, teams typically configure their build to treat them as ERRORS to
get the FULL safety benefit — otherwise, warnings are easy to accumulate
and ignore over time, undermining the entire point of enabling the
feature.

Tags: Warnings-as-errors, Build configuration, Team-wide enforcement

## Common Mistakes

- Enabling nullable reference types but leaving the resulting warnings as mere warnings (not errors) — this makes it easy for null-safety violations to accumulate unnoticed over time, since a warning doesn't stop a build the way a compile error does.
- Using the null-forgiving operator (`!`) to silence a nullable warning without actually verifying the value can't be null — this suppresses the compiler's warning while doing NOTHING to prevent an actual `NullReferenceException` if the value genuinely is null at runtime.

## Exercises

- Trace through what specific warning the compiler emits for using a nullable variable without a check, and explain why adding an `if (x != null)` check makes that warning disappear.
- Explain the difference between a nullable reference type WARNING and an actual runtime `NullReferenceException` — does enabling nullable reference types PREVENT the exception from ever occurring?

## csharp

```csharp
#nullable enable
using System;

string name = "Alice";   // non-nullable -- compiler assumes this is always safe
Console.WriteLine(name.Length);   // no warning -- name is guaranteed non-null by its type

string? maybeName = null;   // nullable -- explicitly marked with ?

if (maybeName != null)
{
    // inside this block, the compiler's flow analysis knows maybeName is non-null
    Console.WriteLine(maybeName.Length);
}
else
{
    Console.WriteLine("maybeName was null, skipped safely");
}

maybeName = "Bob";
if (maybeName != null)
{
    Console.WriteLine(maybeName.Length);
}
```
Walkthrough: `name` is non-nullable, so `name.Length` is used directly
with no warning. `maybeName` is nullable and starts as `null` — the
`if (maybeName != null)` check is what lets the compiler's flow analysis
confirm it's safe to access `.Length` inside that block; without the
check, accessing `.Length` directly would produce a compiler warning
about a possible null reference. After reassigning `maybeName = "Bob"`,
the same check-then-use pattern safely accesses `.Length` again.
