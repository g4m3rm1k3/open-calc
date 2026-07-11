---
series: python-fundamentals
level: 15
title: while Loops
lang: python
---

# while Loops

A `while` loop repeats a block of code for as long as a condition remains `True`. It is Python's mechanism for repetition when you do not know in advance how many times to repeat.

If `if` is "do this once if the condition is true," then `while` is "keep doing this until the condition becomes false."

## Basic while Loop

```python
countdown = 5

while countdown > 0:
    print(countdown)
    countdown = countdown - 1

print("Liftoff!")
```

```text
5
4
3
2
1
Liftoff!
```

The `while` loop:
1. Evaluates `countdown > 0`
2. If `True`, executes the indented body
3. Returns to step 1
4. If `False`, skips the body and continues after the loop

`countdown = countdown - 1` is the **update step** — it changes the variable that the condition checks. Without it, the condition would never become `False` and the loop would run forever.

**Enable Debug and step through this.** Watch `countdown` decrease by 1 on every iteration. Count the iterations.

**CS lens:** The combination of (condition → body → update) is called a **loop invariant pattern**. The condition is checked before every iteration. The body does work. The update brings the state closer to termination. Any `while` loop that does not update its condition variable is almost certainly a bug.

## The Infinite Loop

A loop that never terminates is an **infinite loop**. This is almost always a bug:

```python
value = 1
while value > 0:
    value = value + 1
```

`value` starts at `1` and increases every iteration. `value > 0` is always `True`. This loop never stops.

In the lesson engine, the interpreter will time out. In a real program, it consumes all CPU until you force-quit it.

## break — Exit the Loop Early

`break` immediately exits the loop, regardless of the condition:

```python
search_target = 7
current = 1

while current <= 100:
    if current == search_target:
        print(f"Found {search_target}!")
        break
    current = current + 1

print(f"Stopped at {current}.")
```

```text
Found 7!
Stopped at 7.
```

Without `break`, the loop would continue to 100. `break` exits the loop at the first match.

## continue — Skip to the Next Iteration

`continue` skips the rest of the current iteration and goes back to the condition check:

```python
number = 0

while number < 10:
    number = number + 1
    if number % 2 == 0:
        continue
    print(number)
```

```text
1
3
5
7
9
```

When `number` is even (`number % 2 == 0`), `continue` skips `print(number)` and goes back to the condition. Only odd numbers get printed.

## Accumulator Pattern

The most common use of `while` loops is **accumulation** — building up a result one piece at a time:

```python
total = 0
count = 1

while count <= 10:
    total = total + count
    count = count + 1

print(f"Sum of 1 to 10: {total}")
```

```text
Sum of 1 to 10: 55
```

`total` starts at `0` (the identity value for addition). Each iteration adds the current count. After the loop, `total` holds the sum of all values from 1 to 10.

**CS lens:** This is the **accumulator pattern** — a fundamental pattern in computing. The accumulator starts at a neutral value (0 for sums, 1 for products, `""` for strings, `[]` for lists) and accumulates results one at a time. It appears in every language and every paradigm.

## Challenge: sum_of_digits

Write a function `sum_of_digits(number)` that takes a non-negative integer and returns the sum of its individual digits.

`sum_of_digits(1234)` → `10` (1 + 2 + 3 + 4).

Use a `while` loop. The `%` and `//` operators from Level 7 are the right tools here. The loop should stop when `number` reaches `0`.

```challenge
def sum_of_digits(number):
    pass
```

```test
assert sum_of_digits(0) == 0
assert sum_of_digits(5) == 5
assert sum_of_digits(1234) == 10
assert sum_of_digits(9999) == 36
assert sum_of_digits(100) == 1
```
