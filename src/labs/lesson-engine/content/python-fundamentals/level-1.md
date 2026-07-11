---
series: python-fundamentals
level: 1
title: How Python Reads Your Code
lang: python
---

# How Python Reads Your Code

In Level 0 you learned that Python reads your source code top to bottom and executes each instruction in order. This lesson goes one level deeper: how does Python decide what each line *means* before it executes it?

The answer to that question is what separates programmers who debug by guessing from programmers who debug by reasoning. When you can simulate Python's execution in your head — predict what every line will do before you run it — you can write code faster, find bugs faster, and understand other people's code on first read.

By the end of this lesson you will be able to trace any program line by line, predict its output before clicking Run, and explain the difference between a statement and an expression.

## Statements: Instructions That Do Things

A **statement** is a complete instruction — a line of code that tells Python to *do* something. Python executes statements one at a time, in order, from the top of the file to the bottom.

```python
print("Line one")
print("Line two")
print("Line three")
```

Three statements. Python executes statement 1, then statement 2, then statement 3. The output appears in the same order. Predict the output before you click Run — then run it to verify.

```text
Line one
Line two
Line three
```

That is the execution model. Simple, deterministic, sequential.

## Expressions: Code That Produces Values

An **expression** is a piece of code that Python *evaluates* to produce a value. Every expression produces exactly one value when Python runs it.

```text
2 + 3          → evaluates to 5
"Hello"        → evaluates to "Hello"
10 - 4         → evaluates to 6
"Hi" + "!"     → evaluates to "Hi!"
```

Expressions appear *inside* statements. In `print(2 + 3)`, the statement is the `print()` call, and `2 + 3` is an expression inside it. Python evaluates the expression first (`2 + 3 → 5`), then uses the result as the input to `print()`.

```python
print(2 + 3)
print(10 - 4)
print("Hi" + "!")
```

**Enable Debug and step through this.** Notice that Python does not print `2 + 3` literally — it evaluates the expression first, then prints the result. The evaluating happens before the printing.

**CS lens:** The distinction between statements and expressions is fundamental to how all programming languages work. In Python, an expression can appear wherever a value is needed — inside a function call, on the right side of an assignment, inside another expression. This composability is what makes `print(2 + (3 * 4))` legal: `3 * 4` evaluates to `12`, then `2 + 12` evaluates to `14`, then `print(14)` runs.

## Evaluation Order: Inside Out, Left to Right

When Python encounters a complex expression, it evaluates it from the inside out — innermost parentheses first — then left to right at each level.

A new atom: `*` is the **multiplication operator**. `3 * 4` evaluates to `12`. Python uses `*` instead of `×` because `×` is not on a standard keyboard. Division is `/`: `10 / 2` evaluates to `5.0`. Both are covered fully in Level 7.

```text
print(2 + (3 * 4))

Step 1: evaluate 3 * 4   → 12
Step 2: evaluate 2 + 12  → 14
Step 3: call print(14)   → prints 14
```

This is the same order you learned in school arithmetic: parentheses first, then multiplication, then addition. Python follows those same rules.

```python
result_one = 2 + 3 * 4
result_two = (2 + 3) * 4
print(result_one)
print(result_two)
```

Predict both outputs before running. `result_one` follows standard precedence (multiplication before addition). `result_two` uses parentheses to force addition first.

```text
14
20
```

**A new atom: `=` (assignment)**

`result_one = 14` does not mean "result_one equals 14." It means "bind the name `result_one` to the value `14`." The `=` in Python is the **assignment operator** — it stores a value under a name so you can use that name later. Assignment is covered fully in Level 5. For now: the right side is evaluated first, then stored under the name on the left.

## Mental Simulation: You Are the Interpreter

The most important debugging skill is **mental simulation** — running code in your head the same way Python would run it.

The rules are:

```text
1. Start at line 1.
2. If the line is a statement, execute it.
3. If the line contains an expression, evaluate the expression first.
4. Move to the next line.
5. Repeat until there are no more lines.
```

Try it on this program before running it:

```python
width = 8
height = 5
area = width * height
print("Area:", area)
print("Perimeter:", 2 * (width + height))
```

Work through it:
- Line 1: bind `width` to `8`.
- Line 2: bind `height` to `5`.
- Line 3: evaluate `width * height` → `8 * 5` → `40`. Bind `area` to `40`.
- Line 4: evaluate `"Area:"` → `"Area:"`, evaluate `area` → `40`. Call `print("Area:", 40)`.
- Line 5: evaluate `2 * (width + height)` → `2 * (8 + 5)` → `2 * 13` → `26`. Call `print("Perimeter:", 26)`.

```text
Area: 8
Perimeter: 26
```

**Enable Debug and step through this.** Watch each variable appear in the panel as it is assigned. Confirm that Python runs exactly the steps you predicted.

**SE lens:** The habit of mental simulation before running code is what separates programmers who understand their programs from programmers who "try things until it works." Mental simulation forces you to have a prediction. When the output differs from your prediction, you learn something precise: your mental model was wrong at a specific step. That precision is what makes debugging fast.

## Challenge: step_counter

Write a function `steps_to_meters(step_count)` that converts a step count to meters.

The conversion: every 1,000 steps is approximately 800 meters.

`step_count` — an integer. Returns a float representing the distance in meters.

Use `*` for multiplication and `/` for division. `/` always returns a float in Python, even when both sides are integers — `800 / 1` produces `800.0`, not `800`.

```challenge
def steps_to_meters(step_count):
    pass
```

```test
assert steps_to_meters(1000) == 800.0
assert steps_to_meters(2000) == 1600.0
assert steps_to_meters(500) == 400.0
assert steps_to_meters(0) == 0.0
assert steps_to_meters(10000) == 8000.0
```
