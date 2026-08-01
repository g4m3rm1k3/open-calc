---
series: java-fundamentals
level: 1
title: Control Flow
lang: java
---

# Control Flow

Every program so far has run every line, top to bottom, exactly once. Real programs need to make decisions — run this branch, not that one, depending on what's actually true right now. Java's comparison and logical operators build the conditions; `if`/`else` and `switch` decide what runs based on them.

## Comparison and Logical Operators

```java
public class Main {
    public static void main(String[] args) {
        int score = 85;
        System.out.println(score > 90);
        System.out.println(score >= 80 && score < 90);
        System.out.println(score < 60 || score > 100);
        System.out.println(!(score > 90));
    }
}
```

```text
false
true
false
true
```

`>`, `>=`, `<`, `<=`, `==`, `!=` — comparison operators; each produces a `boolean`, never an `int`, unlike C's historical `0`/`1` convention.

`&&` — logical AND: `true` only when both sides are `true`. `score >= 80 && score < 90` — `85 >= 80` is `true`, `85 < 90` is `true`, so the whole expression is `true`.

`||` — logical OR: `true` when at least one side is `true`. `score < 60 || score > 100` — both sides are `false` here, so the result is `false`.

`!` — logical NOT: flips a `boolean`. `!(score > 90)` — `score > 90` is `false`, so `!false` is `true`.

**CS lens:** `&&` and `||` **short-circuit** — the right side is only evaluated if the left side didn't already determine the answer. `a() || b()` never calls `b()` if `a()` returned `true`; `a() && b()` never calls `b()` if `a()` returned `false`. This matters beyond performance — code like `list != null && list.size() > 0` relies on it: if `list` really is `null`, `list.size()` never runs, and the `NullPointerException` it would have thrown never happens.

## if / else if / else

```java
public class Main {
    static String grade(int score) {
        if (score >= 90) {
            return "A";
        } else if (score >= 80) {
            return "B";
        } else if (score >= 70) {
            return "C";
        } else {
            return "F";
        }
    }

    public static void main(String[] args) {
        System.out.println(grade(95));
        System.out.println(grade(82));
        System.out.println(grade(71));
        System.out.println(grade(50));
    }
}
```

```text
A
B
C
F
```

`if (score >= 90) { ... }` — runs the block only when the condition is `true`. `else if` chains additional conditions, checked in order, only if every earlier one was `false`. `else` catches everything left over.

Each branch here `return`s immediately — the method exits the instant one branch runs; the rest of the chain never gets checked. `grade(95)`: `95 >= 90` is `true` on the very first check, so `"A"` returns immediately, without ever checking `>= 80`.

## The switch Statement

```java
public class Main {
    public static void main(String[] args) {
        int day = 3;
        switch (day) {
            case 1:
                System.out.println("Monday");
                break;
            case 2:
                System.out.println("Tuesday");
                break;
            case 3:
                System.out.println("Wednesday");
                break;
            default:
                System.out.println("Other day");
        }
    }
}
```

```text
Wednesday
```

`switch (day) { case 1: ... }` — compares `day` against each `case` value in turn. `case 3:` matches, so execution jumps directly there.

`break;` — stops the `switch` from **falling through** into the next `case`'s code. Without it, execution after a matching case keeps running every statement below, across every subsequent `case` label, regardless of whether their own values match — a real, historical source of bugs in C-family languages, Java included.

`default:` — runs when no `case` matched; needs no `break` since it's already the last thing in the block.

## The switch Expression

```java
public class Main {
    public static void main(String[] args) {
        int day = 6;
        String type = switch (day) {
            case 1, 2, 3, 4, 5 -> "Weekday";
            case 6, 7 -> "Weekend";
            default -> "Invalid";
        };
        System.out.println(type);
    }
}
```

```text
Weekend
```

`String type = switch (day) { ... };` — a **switch expression**: unlike the `switch` statement above, this one directly *produces a value*, assigned straight into `type`. No `break` is needed or even legal here — `->` (not `:`) means exactly one branch runs and its value becomes the whole expression's result; there is no fall-through to protect against.

`case 6, 7 ->` — multiple values can share one branch, comma-separated, without repeating the arrow or the body — something the older `switch` statement needed a separate, empty `case 6:` / `case 7:` pair (falling through on purpose) to achieve.

**SE lens:** The switch expression exists specifically to remove fall-through as a possibility, not just as a shorter syntax. The older `switch` statement's fall-through behavior is occasionally useful (grouping cases, as `1, 2, 3, 4, 5` shows above) but far more often an accidental bug — a missing `break` that silently runs the wrong branch. Prefer the expression form (`->`) whenever a `switch` is really just computing one value, and reserve the statement form for when several distinct actions genuinely need to run in sequence.

## Challenge: grade_letter

Write a `static String gradeLetter(int score)` method that returns `"A"` for `90` and above, `"B"` for `80`-`89`, `"C"` for `70`-`79`, `"D"` for `60`-`69`, and `"F"` below `60`.

```challenge
static String gradeLetter(int score) {
    // TODO
}
```

```test
assert gradeLetter(95).equals("A")
assert gradeLetter(82).equals("B")
assert gradeLetter(74).equals("C")
assert gradeLetter(61).equals("D")
assert gradeLetter(50).equals("F")
```
