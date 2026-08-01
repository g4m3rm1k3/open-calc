---
series: csharp-fundamentals
level: 3
title: Loops
lang: csharp
---

# Loops

`foreach` already visited every element of an array, one at a time, without saying how many times to repeat or when to stop — C# decided that automatically from the array's own length. A **loop** in the more general sense repeats a block of code based on a condition you control directly: while something is true, a fixed number of times, or until a specific point is reached. C# has four loop forms, each suited to a different shape of repetition.

## while — Repeat While a Condition Holds

```csharp
using System;

class Program
{
    static void Main()
    {
        int i = 0;
        while (i < 5)
        {
            Console.Write(i + " ");
            i++;
        }
        Console.WriteLine();
    }
}
```

```text
0 1 2 3 4 
```

`while (i < 5) { ... }` — checks `i < 5` **before** every iteration, including the first. The body runs, over and over, for as long as the condition stays `true`.

`i++` — increments `i` by `1`. Without this line, `i < 5` would never become `false`, and the loop would run forever — an **infinite loop**, a real and common mistake, not a hypothetical one.

**CS lens:** A `while` loop is the most general loop form — every other loop in this lesson could be rewritten as a `while` loop, but each of the other three exists because it makes one specific, common shape of repetition harder to get wrong.

## do-while — Guaranteed at Least Once

```csharp
using System;

class Program
{
    static void Main()
    {
        int i = 0;
        do
        {
            Console.Write(i + " ");
            i++;
        } while (i < 3);
        Console.WriteLine();

        int j = 10;
        do
        {
            Console.Write(j + " ");
            j++;
        } while (j < 3);
        Console.WriteLine();
    }
}
```

```text
0 1 2 
10 
```

`do { ... } while (condition);` — checks the condition **after** the body runs, not before. The body always executes at least once, even when the condition is already `false` the very first time it's checked — proven by the second loop: `j` starts at `10`, already failing `j < 3`, and the body still runs exactly once before the loop exits.

**SE lens:** `do-while` is the right choice specifically when "run this at least once, then decide whether to repeat" is the real shape of the problem — reading user input and validating it is the classic example: you must ask at least once before there is anything to validate.

## for — A Fixed, Counted Repetition

```csharp
using System;

class Program
{
    static void Main()
    {
        for (int i = 0; i < 5; i++)
        {
            Console.Write(i + " ");
        }
        Console.WriteLine();
    }
}
```

```text
0 1 2 3 4 
```

`for (int i = 0; i < 5; i++) { ... }` — three parts, separated by `;`, all in one place instead of scattered around a `while` loop:
- `int i = 0` — runs once, before the loop starts.
- `i < 5` — checked before every iteration, exactly like a `while` condition.
- `i++` — runs after every iteration's body finishes, before the condition is checked again.

`i` is scoped to the `for` loop itself — it does not exist before the `for` line and cannot be read after the closing `}`.

**SE lens:** A `for` loop puts a loop's entire lifecycle — start, stop condition, and step — in one line, at the top, where a reader sees all three at once. The equivalent `while` version (`int i = 0; while (i < 5) { ...; i++; }`) says the same thing with the initialization and increment separated by the whole loop body, an easy place to lose track of one of them.

## break and continue

```csharp
using System;

class Program
{
    static void Main()
    {
        for (int i = 0; i < 10; i++)
        {
            if (i == 5) break;
            if (i % 2 == 0) continue;
            Console.Write(i + " ");
        }
        Console.WriteLine();
    }
}
```

```text
1 3 
```

`break;` — exits the loop immediately, skipping every remaining iteration. Once `i == 5`, the loop stops entirely — `5`, `6`, `7`, `8`, `9` are never even checked.

`continue;` — skips the rest of *this* iteration's body and jumps straight to the next one, without exiting the loop. `i % 2 == 0` is `true` for `0`, `2`, `4` — each of those is skipped by `continue` before reaching the `Console.Write` line, so only the odd numbers below `5` (`1` and `3`) actually print.

**SE lens:** `break` and `continue` both interrupt a loop's normal, one-line-at-a-time flow — used sparingly, they make an early-exit condition instantly visible; overused, especially several `break`/`continue` statements scattered through one long loop body, they can make the actual order of execution hard to trace without running it.

## Nested Loops

```csharp
using System;

class Program
{
    static void Main()
    {
        for (int i = 0; i < 3; i++)
        {
            for (int j = 0; j < 3; j++)
            {
                Console.Write(i * 3 + j + " ");
            }
        }
        Console.WriteLine();
    }
}
```

```text
0 1 2 3 4 5 6 7 8 
```

A loop's body can contain another loop. The inner `for (int j = ...)` runs to completion — all three values of `j` — for every single value of the outer `i`. `i` and `j` are independent counters; `j` resets to `0` at the start of each new outer iteration, which is why the inner loop always produces exactly three values (`0`, `1`, `2`) regardless of what `i` currently is.

**CS lens:** Nesting loops multiplies their iteration counts — two loops each running `3` times produce `3 × 3 = 9` total inner-body executions, not `3 + 3 = 6`. This is the concrete origin of the O(n²) complexity class: an algorithm with one loop nested inside another, both scaling with the same input size `n`, does roughly `n²` units of work.

## Challenge: count_vowels

Write a `static int CountVowels(string text)` method that counts how many characters in `text` are vowels (`a`, `e`, `i`, `o`, `u`, case-insensitive). Use a `for` loop to visit every character by index, and check each one against the five vowels.

```challenge
static int CountVowels(string text)
{
    // TODO
}
```

```test
assert CountVowels("hello") == 2
assert CountVowels("HELLO") == 2
assert CountVowels("xyz") == 0
assert CountVowels("") == 0
assert CountVowels("AEIOU") == 5
assert CountVowels("programming") == 3
```
