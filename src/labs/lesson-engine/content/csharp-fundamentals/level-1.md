---
series: csharp-fundamentals
level: 1
title: Control Flow
lang: csharp
---

# Control Flow

Every program so far has run every line, in order, exactly once. Real programs need to make decisions — run this block only if a condition holds, choose between several branches, skip everything if nothing matches. C# offers two ways to express a decision: `if`/`else` for open-ended conditions, and `switch` for choosing among a fixed set of known values.

## Comparison and Logical Operators

Before a decision can be made, a condition needs to evaluate to `true` or `false`.

```csharp
using System;

class Program
{
    static void Main()
    {
        int age = 20;
        int minAge = 18;

        Console.WriteLine(age == minAge);
        Console.WriteLine(age != minAge);
        Console.WriteLine(age > minAge);
        Console.WriteLine(age >= minAge);
        Console.WriteLine(age < minAge);

        bool hasLicense = true;
        Console.WriteLine(age >= minAge && hasLicense);
        Console.WriteLine(age < minAge || hasLicense);
        Console.WriteLine(!hasLicense);
    }
}
```

```text
False
True
True
True
False
True
True
False
```

`==` — equality comparison. Not to be confused with `=`, which is assignment. `age == minAge` asks a question; `age = minAge` gives an order.
`!=` — not-equal.
`>`, `>=`, `<`, `<=` — ordering comparisons, same meaning as in mathematics.

Every comparison operator produces a `bool` — `true` or `false` — never anything else.

`&&` — logical AND. `a && b` is `true` only when both `a` and `b` are `true`.
`||` — logical OR. `a || b` is `true` when at least one of `a` or `b` is `true`.
`!` — logical NOT. Flips `true` to `false` and back.

**CS lens:** `&&` and `||` **short-circuit** — the right-hand side is only evaluated if the left-hand side doesn't already determine the answer. `age >= minAge && hasLicense` never even looks at `hasLicense` if `age >= minAge` is already `false`, because the whole expression can't be `true` either way. This matters when the right-hand side has a side effect, or could fail — `array.Length > 0 && array[0] == target` never touches `array[0]` on an empty array, because the length check already failed.

## if / else

```csharp
using System;

class Program
{
    static void Main()
    {
        int score = 72;

        if (score >= 90)
        {
            Console.WriteLine("A");
        }
        else if (score >= 80)
        {
            Console.WriteLine("B");
        }
        else if (score >= 70)
        {
            Console.WriteLine("C");
        }
        else
        {
            Console.WriteLine("F");
        }
    }
}
```

```text
C
```

`if (condition) { ... }` — the block runs only when `condition` is `true`. The parentheses around the condition are required; the braces are optional for a single statement but conventionally always written.

`else if (condition) { ... }` — checked only if every condition above it was `false`. C# evaluates top to bottom and stops at the first branch whose condition is `true` — `score >= 70` is `true` for `score = 72`, but `score >= 90` and `score >= 80` were checked and rejected first.

`else { ... }` — runs only if every condition above was `false`. Optional — an `if` needs no `else` at all.

**SE lens:** Order matters when ranges overlap. Writing `score >= 70` before `score >= 90` would be a real bug — a score of `95` would match the first (`>= 70`) branch and print `C`, never reaching the correct `A` branch. Broadest-last, narrowest-first is not a style preference here; it's the only order that produces correct results.

## switch — Choosing Among Known Values

```csharp
using System;

class Program
{
    static void Main()
    {
        int dayNumber = 3;
        string dayName;

        switch (dayNumber)
        {
            case 1:
                dayName = "Monday";
                break;
            case 2:
                dayName = "Tuesday";
                break;
            case 3:
                dayName = "Wednesday";
                break;
            default:
                dayName = "Unknown";
                break;
        }

        Console.WriteLine(dayName);
    }
}
```

```text
Wednesday
```

`switch (dayNumber)` — evaluates `dayNumber` once, then compares it against each `case` value in turn.
`case 3:` — matches when `dayNumber == 3`. Runs the statements below it.
`break;` — exits the `switch` immediately. **Required** at the end of every `case` in this classic form — without it, C# raises a compile error rather than silently falling through to the next case (a real, deliberate difference from C and C++, which fall through by default).
`default:` — runs when no `case` matched. Like `else` for `if`, always optional but conventionally present.

## Sharing One Body Across Several Cases

Two or more `case` labels can share a single body by stacking the labels — useful when several distinct values should be treated identically:

```csharp
using System;

class Program
{
    static void Main()
    {
        int dayNumber = 6;
        string kind;

        switch (dayNumber)
        {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
                kind = "Weekday";
                break;
            case 6:
            case 7:
                kind = "Weekend";
                break;
            default:
                kind = "Invalid";
                break;
        }

        Console.WriteLine(kind);
    }
}
```

```text
Weekend
```

`case 1: case 2: case 3: case 4: case 5:` — five labels stacked with no body between them. C# matches `dayNumber` against every label in the stack; whichever one matches, execution falls into the single shared body written after the last label. This is not the same as C's fallthrough — an empty `case` label falling into the next is always allowed and never needs its own `break`; a `case` with a real body still requires one, exactly as before.

**SE lens:** Stacking labels is the honest way to express "these values mean the same thing" — five separate `case 1: kind = "Weekday"; break;` blocks would repeat the same line five times, and a future edit to the weekday logic would have to be made in five places instead of one.

## Challenge: grade_letter

Write a `static string GradeLetter(int score)` method that returns the letter grade for a numeric score:
- `90` and above → `"A"`
- `80` to `89` → `"B"`
- `70` to `79` → `"C"`
- below `70` → `"F"`

Check from the highest threshold down, so a single score never matches more than one intended range.

```challenge
static string GradeLetter(int score)
{
    // TODO
}
```

```test
assert GradeLetter(95) == "A"
assert GradeLetter(80) == "B"
assert GradeLetter(89) == "B"
assert GradeLetter(72) == "C"
assert GradeLetter(69) == "F"
assert GradeLetter(0) == "F"
```
