---
series: python-fundamentals
level: 2
title: The Debugger
lang: python
---

# The Debugger

Mental simulation tells you what a program *should* do. The debugger shows you what it *actually* does — step by step, variable by variable, line by line.

Every professional programmer uses a debugger. Not occasionally — constantly. A developer who does not know how to debug is like a mechanic who does not own a lift: they can still do some work, but they are always guessing about the parts they cannot see.

This lesson teaches the debugger built into the lesson engine. The same concepts apply to every debugger in every language and every tool — VS Code, PyCharm, Chrome DevTools, gdb. Learn it once here, apply it everywhere.

By the end of this lesson you will be able to step through any program one line at a time, inspect the value of every variable at every step, and use that information to verify (or correct) your mental model.

## What the Debugger Does

A debugger runs your program in slow motion. Instead of executing all instructions instantly, it pauses after each one and lets you inspect the state of the program: what variables exist, what values they hold, which line is about to execute.

The lesson engine debugger has two controls:

```text
Enable Debug checkbox   — turns on tracing before you click Run
‹  ›  buttons           — step backward and forward through the execution
```

The right panel shows:
- **Debug tab** — the current step number and total steps
- **Variables panel** — every local variable and its current value at this exact step

**Enable Debug, then click Run on this program:**

```python
first_number = 10
second_number = 25
total = first_number + second_number
doubled = total * 2
print(doubled)
```

Then use ‹ and › to step through it. Watch each variable appear the moment Python assigns it.

```text
Step 1:  first_number = 10      (first_number appears in variables panel: 10)
Step 2:  second_number = 25     (second_number appears: 25)
Step 3:  total = 35             (first_number + second_number evaluated → 35)
Step 4:  doubled = 70           (total * 2 evaluated → 70)
Step 5:  print(70)              (output: 70)
```

You are watching Python think. The debugger makes the invisible visible.

**CS lens:** The debugger works by **instrumentation** — the tracing system records the program's state (variable names and values) after every statement executes, then replays that recording for you. No code is re-executed when you step. You are watching a recording, not running the program in real time.

## The Variables Panel

The variables panel shows you every name that currently exists in the program's memory, and what value each name holds.

This is the **runtime state** — the complete description of what the program "knows" at a specific moment in execution. Different steps have different state.

```python
temperature_celsius = 100
temperature_fahrenheit = (temperature_celsius * 9 / 5) + 32
boiling_description = "Water boils at " + str(temperature_fahrenheit) + "F"
print(boiling_description)
```

**A new atom: `str()`**

`str(value)` — converts a value to its string representation. `str(212.0)` produces `"212.0"`. This is needed here because you cannot concatenate a string and a float directly — Python does not assume you want to combine different types. The full explanation of type conversion is in Level 6.

**Enable Debug and step through this.** At step 2, `temperature_fahrenheit` should be `212.0`. Verify that before stepping to step 3.

The habit to build: **before stepping to the next line, predict what the variables panel will show, then step and check.** If your prediction is wrong, you have found a gap in your understanding — right now, not after the bug appears.

## Stepping Through a Function Call

When a function is called, Python jumps into the function's body and executes it. The debugger follows.

```python
def celsius_to_fahrenheit(celsius):
    fahrenheit = (celsius * 9 / 5) + 32
    return fahrenheit

reading_one = celsius_to_fahrenheit(0)
reading_two = celsius_to_fahrenheit(100)
print(reading_one, reading_two)
```

**Enable Debug and step through this.** Watch what happens:

```text
Step 1:  def celsius_to_fahrenheit(...)   — Python registers the function (does not run it yet)
Step 2:  call celsius_to_fahrenheit(0)    — Python jumps into the function
Step 3:  fahrenheit = 32.0               — inside the function, celsius = 0
Step 4:  return 32.0                     — returns to the call site
Step 5:  reading_one = 32.0             — the returned value is stored
Step 6:  call celsius_to_fahrenheit(100) — second call
Step 7:  fahrenheit = 212.0             — inside the function, celsius = 100
Step 8:  return 212.0
Step 9:  reading_two = 212.0
Step 10: print(32.0, 212.0)
```

Notice: `celsius` and `fahrenheit` exist only while the function is running. When the function returns, those variables disappear from the panel. This is **scope** — variables only exist inside the function that created them. Scope is covered fully in Level 19.

**SE lens:** Stepping through a function call manually is the first debugging technique every professional uses when a function returns the wrong answer. You do not guess which line is wrong — you step into the function, watch every variable, and find the exact step where the value diverges from what you expected. That precision turns hours of guessing into minutes of observation.

## When the Debugger Saves You

Here is a function with a bug. Predict what it does, then enable Debug and step through it to find the exact line where it goes wrong:

```python
def average(value_a, value_b, value_c):
    total = value_a + value_b + value_c
    result = total / 2
    return result

print(average(10, 20, 30))
```

Expected: the average of 10, 20, and 30 is `20.0`. What does it actually return?

Step through it. Find the line. The bug is on line 3 — `total / 2` should be `total / 3` (three numbers, not two). The debugger shows you `total = 60` at step 2, then `result = 30.0` at step 3 — wrong. Without the debugger you might have stared at this for minutes. With it, you found it in seconds.

## Challenge: distance_between

Write a function `distance_between(x1, y1, x2, y2)` that returns the distance between two points on a grid.

The distance formula: `distance = ((x2 - x1)**2 + (y2 - y1)**2) ** 0.5`

`**` — the exponentiation operator. `2 ** 3` produces `8` (2 to the power of 3). `value ** 0.5` produces the square root of `value`.

Returns a float. Use Debug to step through your solution and verify that each intermediate calculation is what you expect before checking the final answer.

```challenge
def distance_between(x1, y1, x2, y2):
    pass
```

```test
assert distance_between(0, 0, 3, 4) == 5.0
assert distance_between(0, 0, 0, 0) == 0.0
assert distance_between(1, 1, 4, 5) == 5.0
assert round(distance_between(0, 0, 1, 1), 5) == round(2 ** 0.5, 5)
assert distance_between(-3, -4, 0, 0) == 5.0
```
