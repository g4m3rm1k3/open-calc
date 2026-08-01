---
series: csharp-fundamentals
level: 9
title: Enums
lang: csharp
---

# Enums

A `Direction` genuinely only ever needs to be one of four things — north, south, east, or west. Representing it as a `string` (`"North"`) or an `int` (`0`) both work, but neither actually *prevents* an invalid value: nothing stops `"Nrth"` (a typo) or `99` (meaningless) from being assigned. An **enum** is a real, named, closed set of possible values — the type system itself enforces that a `Direction` variable can only ever hold one of the values actually listed.

## Declaring and Using an Enum

```csharp
using System;

enum Direction { North, South, East, West }

class Program
{
    static void Main()
    {
        Direction d = Direction.North;
        Console.WriteLine(d);
        Console.WriteLine((int)d);

        Direction d2 = Direction.West;
        Console.WriteLine((int)d2);
    }
}
```

```text
North
0
3
```

`enum Direction { North, South, East, West }` — declares a new type, `Direction`, whose only possible values are the four named ones.

`Direction d = Direction.North;` — a value is always written as `EnumType.ValueName`, never just `North` alone — the full name states unambiguously which enum it belongs to.

`Console.WriteLine(d);` — printing an enum value prints its **name**, `"North"`, not a raw number.

`(int)d` — every enum value has an underlying `int`, assigned automatically in declaration order starting at `0`: `North` is `0`, `South` is `1`, `East` is `2`, `West` is `3`.

## Assigning Specific Underlying Values

```csharp
using System;

enum Status { Pending = 1, Active = 5, Closed = 10 }

class Program
{
    static void Main()
    {
        Status s = Status.Active;
        Console.WriteLine((int)s);
        Console.WriteLine(s);
    }
}
```

```text
5
Active
```

`enum Status { Pending = 1, Active = 5, Closed = 10 }` — explicit underlying values, instead of the automatic `0, 1, 2, ...`. Useful when the numbers themselves carry real meaning — a status code stored in a database, for instance, where `5` needs to mean exactly `Active` even if more values get inserted between existing ones later.

## Enums in a switch

```csharp
using System;

enum Direction { North, South, East, West }

class Program
{
    static string Describe(Direction d)
    {
        switch (d)
        {
            case Direction.North: return "Up";
            case Direction.South: return "Down";
            case Direction.East: return "Right";
            case Direction.West: return "Left";
            default: return "Unknown";
        }
    }

    static void Main()
    {
        Console.WriteLine(Describe(Direction.East));
    }
}
```

```text
Right
```

`case Direction.North:` — a `switch` (Level 1) over an enum reads naturally: every real case is named directly, and — because `Direction` only has four possible values — a reader can see at a glance whether every one of them was actually handled. `default:` remains present as a safety net, but with an enum, the compiler already guarantees `d` can never be anything the four `case`s didn't already anticipate.

**SE lens:** This is the real, practical payoff enums have over a raw `int` or `string` status code: a typo in a `string` (`"Actve"`) compiles fine and fails silently at runtime; the equivalent typo in an enum (`Status.Actve`) is a compile error, caught before the program ever runs, because `Actve` simply does not exist as a member of `Status`.

## Enum.Parse and Enum.GetValues

```csharp
using System;

enum Direction { North, South, East, West }

class Program
{
    static void Main()
    {
        Direction d = (Direction)Enum.Parse(typeof(Direction), "South");
        Console.WriteLine(d);

        foreach (Direction dir in Enum.GetValues(typeof(Direction)))
        {
            Console.Write(dir + " ");
        }
        Console.WriteLine();
    }
}
```

```text
South
North South East West 
```

`Enum.Parse(typeof(Direction), "South")` — converts a real, runtime `string` (perhaps read from a file or typed by a user) into the matching `Direction` value. Returns `object`, so `(Direction)` casts it back to the real enum type — useful specifically because the string isn't known until the program is already running, unlike `Direction.South`, which only works when the value is known while writing the code.

`Enum.GetValues(typeof(Direction))` — returns every value the enum defines, in declaration order — a real, reflective way to loop over "all four directions" without hand-listing them.

## Challenge: opposite_direction

Write a `static Direction Opposite(Direction d)` method that returns the opposite of a given `Direction` — `North`↔`South`, `East`↔`West`. Declare the enum yourself as part of your answer: `enum Direction { North, South, East, West }`.

```challenge
enum Direction { North, South, East, West }

static Direction Opposite(Direction d)
{
    // TODO
}
```

```test
assert Opposite(Direction.North) == Direction.South
assert Opposite(Direction.South) == Direction.North
assert Opposite(Direction.East) == Direction.West
assert Opposite(Direction.West) == Direction.East
```
