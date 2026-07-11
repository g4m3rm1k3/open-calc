---
series: python-fundamentals
level: 25
title: Modules & Imports
lang: python
---

# Modules & Imports

A module is a Python file. When you write `import math`, Python finds the file `math.py` (or the compiled equivalent) in its standard library and makes its functions and variables available to you. Modules are how Python organises and shares code.

The standard library ships with Python and contains modules for mathematics, dates, files, networking, compression, cryptography, and hundreds of other tasks. Knowing what exists in it saves you from re-implementing things that have already been written, tested, and optimised.

## import — Importing a Module

```python
import math

print(math.pi)
print(math.sqrt(16))
print(math.floor(3.7))
print(math.ceil(3.2))
```

```text
3.141592653589793
4.0
3
4
```

`import math` — makes the `math` module available under the name `math`. Every function and constant in the module is accessed with `math.name`.

- `math.pi` — the mathematical constant π to 15 significant digits
- `math.sqrt(x)` — square root of `x`. Returns a float. `sqrt(16)` → `4.0`.
- `math.floor(x)` — rounds down to the nearest integer. `floor(3.7)` → `3`.
- `math.ceil(x)` — rounds up to the nearest integer. `ceil(3.2)` → `4`.

## from...import — Importing Specific Names

`from module import name` imports a specific name directly, without the module prefix:

```python
from math import pi, sqrt, log, e

print(pi)
print(sqrt(25))
print(log(e))
```

```text
3.141592653589793
5.0
1.0
```

`from math import pi` makes `pi` available without the `math.` prefix. Use this when you need a few specific names from a large module. Avoid `from math import *` — it imports everything and pollutes your namespace with names you may not know about.

## import...as — Aliasing

`import module as alias` gives the module a shorter name:

```python
import random as rnd

print(rnd.randint(1, 6))
print(rnd.choice(["heads", "tails"]))
print(rnd.random())
```

```text
4
tails
0.7234891234
```

- `random.randint(a, b)` — returns a random integer between `a` and `b` inclusive.
- `random.choice(sequence)` — returns a random element from the sequence.
- `random.random()` — returns a random float between `0.0` and `1.0`.

## The datetime Module

```python
from datetime import date, datetime

today = date.today()
now = datetime.now()

print(today)
print(now.year)
print(now.strftime("%Y-%m-%d %H:%M"))
```

```text
2026-07-11
2026
2026-07-11 06:12
```

`date.today()` — returns the current date as a `date` object.
`datetime.now()` — returns the current date and time as a `datetime` object.
`.strftime(format)` — formats the datetime as a string. `%Y` is the 4-digit year, `%m` the month, `%d` the day, `%H` the hour, `%M` the minutes.

## The os.path Module

```python
import os

current_directory = os.getcwd()
home_directory = os.path.expanduser("~")
joined = os.path.join("Users", "ada", "documents", "file.txt")

print(current_directory)
print(joined)
```

```text
/home/user
Users/ada/documents/file.txt
```

`os.path.join()` builds file paths correctly for the current operating system — it uses `\` on Windows and `/` on Unix, so your code works on both.

**SE lens:** Modules enforce **separation of concerns** at the file level. Each module has one job. `math` does mathematics. `random` does randomness. `datetime` handles dates and times. When you write your own modules, each file should have a single, clear responsibility. This is the same Single Responsibility Principle that applies to functions, applied at the file level.

## Challenge: statistics_summary

Write a function `statistics_summary(numbers)` that returns a dictionary with three keys:

- `"mean"` — the average, rounded to 2 decimal places
- `"variance"` — the average of the squared differences from the mean, rounded to 2 decimal places
- `"std_dev"` — the square root of the variance, rounded to 2 decimal places

Use `math.sqrt()` for the square root.

`mean = sum(numbers) / len(numbers)`
`variance = sum((x - mean)**2 for x in numbers) / len(numbers)`

The expression `(x - mean)**2 for x in numbers` inside `sum()` is a generator expression — like a `for` loop compressed into one line. Sum iterates it automatically.

```challenge
def statistics_summary(numbers):
    import math
    pass
```

```test
result = statistics_summary([2, 4, 4, 4, 5, 5, 7, 9])
assert result["mean"] == 5.0
assert result["variance"] == 4.0
assert result["std_dev"] == 2.0
result2 = statistics_summary([1, 2, 3])
assert result2["mean"] == 2.0
assert round(result2["variance"], 2) == 0.67
```
