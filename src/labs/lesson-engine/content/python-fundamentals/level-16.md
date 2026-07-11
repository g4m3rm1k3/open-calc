---
series: python-fundamentals
level: 16
title: for Loops
lang: python
---

# for Loops

A `for` loop iterates over a sequence — visiting each item in order, one at a time. Where `while` repeats until a condition is false, `for` repeats once for each item in a collection. This distinction matters: use `for` when you know what to iterate over, `while` when you know when to stop.

## Iterating Over a String

A string is a sequence of characters, so `for` can iterate over it:

```python
word = "Python"

for character in word:
    print(character)
```

```text
P
y
t
h
o
n
```

`for character in word:` — on each iteration, `character` is bound to the next character in `word`. The loop runs exactly `len(word)` times.

**Enable Debug and step through this.** Watch `character` change at the start of each iteration. This is the clearest way to see what `for` does.

## Iterating Over a List

Lists (covered fully in Level 20) are sequences of values. `for` works on them identically:

```python
temperatures = [22, 35, 18, 29, 41]

for temp in temperatures:
    print(f"{temp}°C")
```

```text
22°C
35°C
18°C
29°C
41°C
```

`for temp in temperatures:` — `temp` is bound to each element in order.

## range() — Iterating Over Numbers

`range(n)` generates the integers from `0` up to (but not including) `n`. It is the standard way to iterate a specific number of times or over indices:

```python
for count in range(5):
    print(count)
```

```text
0
1
2
3
4
```

`range(start, stop)` generates integers from `start` up to (not including) `stop`:

```python
for number in range(1, 6):
    print(number)
```

```text
1
2
3
4
5
```

`range()` is covered in depth in Level 17.

## The Accumulator Pattern with for

The accumulator pattern from `while` loops works with `for` too — and is usually cleaner:

```python
scores = [88, 92, 75, 95, 83]

total = 0
for score in scores:
    total = total + score

average = total / len(scores)
print(f"Average: {average:.1f}")
```

```text
Average: 86.6
```

The `for` version is cleaner than the `while` equivalent because there is no counter variable to manage manually.

**CS lens:** `for` loops in Python implement the **iterator protocol** — a generalised mechanism that works on anything that knows how to produce values one at a time (strings, lists, files, generators, database cursors). You do not need to know the length in advance. This is more powerful than index-based loops.

**SE lens:** Prefer `for` over `while` whenever you are iterating over a sequence. `for` makes the intent explicit: "visit each item." `while` requires reading the entire loop to understand what it iterates over.

## break and continue in for

`break` and `continue` work the same as in `while` loops:

```python
names = ["Alice", "Bob", "STOP", "Charlie", "David"]

for name in names:
    if name == "STOP":
        break
    print(f"Processing: {name}")
```

```text
Processing: Alice
Processing: Bob
```

The loop stops at `"STOP"` and never reaches `"Charlie"` or `"David"`.

## Challenge: count_vowels

Write a function `count_vowels(text)` that returns the number of vowels in the string.

Vowels are: `a e i o u` (lowercase and uppercase).

`.lower()` — returns the string in lowercase. Use this to treat `"A"` and `"a"` as the same.

`in` — membership test. `"a" in "aeiou"` → `True`.

Iterate over each character in `text` with a `for` loop. Count the ones that are vowels.

```challenge
def count_vowels(text):
    pass
```

```test
assert count_vowels("hello") == 2
assert count_vowels("Python") == 1
assert count_vowels("aeiou") == 5
assert count_vowels("rhythm") == 0
assert count_vowels("Hello World") == 3
assert count_vowels("") == 0
```
