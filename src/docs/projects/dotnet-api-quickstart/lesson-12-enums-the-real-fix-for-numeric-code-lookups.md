# Lesson 12: Enums — The Real Fix for Numeric-Code Lookups

**What this covers:** replacing a hand-maintained Python `dict`
mapping numeric codes to string labels with `enum` — a real, built-in
C# type made for exactly that job, checked by the compiler instead of
trusted at runtime.

**What you need first:** [Lesson 11](lesson-11-just-enough-csharp-syntax.md).

---

## The real problem, restated

```python
PART_STATUS = {
    0: "Draft",
    1: "Released",
    2: "Obsolete",
}

label = PART_STATUS[status_code]
```

A real, plain dict works, but it has a real, honest cost: nothing
stops `status_code` from being `7` — a real key that doesn't exist —
and nothing tells you, anywhere, that `0`, `1`, and `2` are the
complete, real set of valid values. That knowledge lives only in your
head, and in however many, real, separate dicts you've written it into
— twenty times over, by your own count.

## The real, built-in replacement

```csharp
public enum PartStatus
{
    Draft = 0,
    Released = 1,
    Obsolete = 2
}
```

An `enum` is a real, named set of integer constants, declared once. Now
`PartStatus.Released` **is** the real value `1` — but the compiler
also knows there are only three real, valid members, and a variable
declared `PartStatus` can only ever real, legally hold one of them
directly in your own code:

```csharp
PartStatus status = PartStatus.Released;
Console.WriteLine(status); // prints "Released" — no dict lookup needed
```

`Console.WriteLine(status)` prints the real member's own name,
automatically — `ToString()` on any enum does this by default. That
alone replaces most of what a lookup dict was doing for you.

## Converting a real, raw numeric value into an enum

A real host API commonly still hands you a raw `int`, not your own
enum type — you need to go the other direction:

```csharp
int rawValue = 1; // came from somewhere else, e.g. a real API call
PartStatus status = (PartStatus)rawValue;
```

This real, explicit cast is required — C# won't do it silently, since
an `int` could real, legally hold a value with no matching enum member
at all (`(PartStatus)99` compiles and runs without complaint, and
produces a real, technically-invalid `PartStatus` holding `99`). If
the raw value might genuinely be untrusted, check first:

```csharp
if (Enum.IsDefined(typeof(PartStatus), rawValue))
{
    PartStatus status = (PartStatus)rawValue;
}
else
{
    // a real, genuinely unexpected code — handle it explicitly
}
```

## Going from a real string back to an enum

```csharp
if (Enum.TryParse<PartStatus>("Released", out PartStatus status))
{
    Console.WriteLine(status); // Released
}
```

`Enum.TryParse` is the real, direct opposite of the cast above — text
in, a real enum value out, with a real, built-in `bool` telling you
whether it actually matched something.

## When you still want a real, small lookup — friendlier labels

```csharp
public enum PartStatus
{
    Draft,
    Released,
    Obsolete
}

public static class PartStatusExtensions
{
    public static string ToDisplayLabel(this PartStatus status) => status switch
    {
        PartStatus.Draft => "Draft (not released)",
        PartStatus.Released => "Released — Approved for Production",
        PartStatus.Obsolete => "Obsolete — Do Not Use",
        _ => status.ToString()
    };
}
```

If a real, human-facing label needs to say more than the bare member
name, that's still a real, legitimate case for a lookup — just now
it's a real `switch` keyed by a checked, real enum value instead of a
raw, unchecked `int`, and the compiler will warn you if you ever add a
new real `PartStatus` member and forget to handle it here. (This
particular shape — a method written as if it belonged to a type you
didn't write — is a real **extension method**, covered next in
[Lesson 16](lesson-16-extension-methods.md).)

## Before writing your own — check the real host API first

Many real host APIs already define their own, real enums for exactly
this kind of status/type code. Before creating `PartStatus` yourself,
use Lesson 03's reflection or Lesson 04's Object Browser to check
whether the real API you're working against already exposes one —
using the host's own real type, instead of inventing a parallel one,
means your code stays real and correct automatically if the host ever
adds a new real value.

## Definition of done

- [ ] You replaced one of your own real Python lookup dicts with a
      real C# `enum` and confirmed `ToString()` gives you the label.
- [ ] You converted a real, raw `int` into your enum with an explicit
      cast, and can explain why the cast is required.
- [ ] You used `Enum.IsDefined` to guard against a real, unexpected
      numeric value.
- [ ] You checked whether a real host API already defines its own enum
      for a code you were about to model yourself.

## Next

[Lesson 13 — Exception Handling](lesson-13-exception-handling.md) covers
what happens when a real call — into your own code or a real host
API — fails, and how to handle that safely.
