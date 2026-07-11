---
series: python-fundamentals
level: 27
title: List Comprehensions
lang: python
---

A list comprehension builds a new list by applying an expression to each item in an iterable. It exists because the pattern "start with an empty list, loop over something, append a result each iteration" is so common that Python built it into a single expression. The result is the same list — the comprehension is a shorter, more readable way to write the same thing.

## What "Iterable" Means Here

An **iterable** is any object Python can step through one item at a time: a list, a string, a tuple, a `range`, a dictionary, a set, or a file. Every `for` loop variable since Level 15 has been iterating over an iterable. A list comprehension iterates over any of these in exactly the same way.

## The Pattern — Without and With

Without a comprehension, building a transformed list takes four lines:

```python
numbers = [1, 2, 3, 4, 5]
squares = []
for number in numbers:
    squares.append(number ** 2)
print(squares)
print(numbers)
```

```text
[1, 4, 9, 16, 25]
[1, 2, 3, 4, 5]
```

`numbers` is unchanged — `append` built a new list called `squares`. This is important: the `for` loop above never modifies the original.

A comprehension writes the same operation as a single expression:

```python
numbers = [1, 2, 3, 4, 5]
squares = [number ** 2 for number in numbers]
print(squares)
print(numbers)
```

```text
[1, 4, 9, 16, 25]
[1, 2, 3, 4, 5]
```

Both versions produce an identical `squares`. The original `numbers` is untouched in both. A comprehension **always creates a new list** — it never modifies the iterable it reads from.

**Syntax:** `[expression for variable in iterable]`

Reading the syntax left to right tells you the order Python evaluates it:

```text
1. Take each item from the iterable → "for number in numbers"
2. Bind the current item to the variable → number = 1, then 2, then ...
3. Evaluate the expression for this item → number ** 2 = 1, 4, 9, ...
4. Append the result to the new list being built
5. Repeat until the iterable is exhausted
```

**Enable Debug and step through the `for` loop version.** Watch `squares` grow one element at a time. The comprehension executes the same steps invisibly — the debugger cannot show you inside a comprehension, which is one reason to prefer the explicit loop while learning.

**CS lens:** A list comprehension is Python's implementation of the **map** operation — applying a function to every element of a collection and collecting the results. `[f(x) for x in items]` maps `f` over `items`. Map is one of three fundamental operations on collections (the others are filter and reduce). Recognising these patterns in code is how experienced developers read unfamiliar programs quickly.

## Filtering — Keeping Only Some Items

Add an `if` clause to include only items where a condition is true:

```python
scores = [88, 45, 92, 37, 75, 60, 95]
passing = [score for score in scores if score >= 60]
print(passing)
```

```text
[88, 92, 75, 60, 95]
```

**Syntax:** `[expression for variable in iterable if condition]`

The evaluation order with a filter:

```text
1. Take each item from the iterable → score = 88, 45, 92, ...
2. Evaluate the condition → 88 >= 60 is True; 45 >= 60 is False; ...
3. If True: evaluate the expression and append
   If False: skip this item entirely
4. Repeat until the iterable is exhausted
```

`45` and `37` never reach the expression — they are skipped at step 3. The resulting list is a strict subset of the original.

This is the **filter** operation. The filter does not transform — `score for score in scores` leaves each value unchanged, and the `if` clause decides which ones to keep.

## Filtering and Transforming Together

A comprehension can do both in one expression: filter which items to include, and transform the ones that pass:

```python
readings = [15, -3, 22, -8, 0, 41, -1]
positive_doubled = [reading * 2 for reading in readings if reading > 0]
print(positive_doubled)
```

```text
[30, 44, 82]
```

Evaluation order: step through `readings` → skip any `reading <= 0` → for the ones that pass, compute `reading * 2` → collect into the new list. The filter and the transform are applied in sequence on each item.

Without a comprehension, this would be:

```python
positive_doubled = []
for reading in readings:
    if reading > 0:
        positive_doubled.append(reading * 2)
```

Same result. The comprehension makes this four-line pattern one line.

## Comprehensions Work on Any Iterable

Because a comprehension iterates over any iterable, it works equally on strings, ranges, tuples, and dictionaries — not only lists:

```python
sentence = "hello world"
upper_chars = [char.upper() for char in sentence if char != " "]
print(upper_chars)

even_squares = [n ** 2 for n in range(1, 8) if n % 2 == 0]
print(even_squares)
```

```text
['H', 'E', 'L', 'L', 'O', 'W', 'O', 'R', 'L', 'D']
[4, 16, 36]
```

The first iterates over a string (each character). The second iterates over a `range`. The syntax is identical — the iterable after `in` determines what gets stepped through.

## When Not to Use a Comprehension

A comprehension builds a list. Its value is the list. If you would not store the result in a variable, do not use a comprehension:

```python
numbers = [1, 2, 3, 4, 5]

# Wrong: using a comprehension for its side effect, not its value
[print(n) for n in numbers]

# Right: use a for loop when you want side effects
for n in numbers:
    print(n)
```

Both print the same output. The comprehension version creates a list of `None` values (what `print` returns) and immediately discards it — pointless work that confuses readers.

**SE lens:** A comprehension is clear when it has one expression and one optional condition and the result is used. A comprehension with a complex expression, two conditions, or nested structure is harder to read than an equivalent `for` loop. The test: if you cannot read the comprehension aloud as a sentence in under three seconds, write the loop instead.

## Dictionary Comprehensions

The same pattern works for dictionaries. A list comprehension produces one value per item; a dictionary comprehension produces one key-value pair per item:

```text
List comprehension:       [expression for var in iterable]
Dict comprehension:       {key_expr: value_expr for var in iterable}
```

```python
words = ["hello", "world", "python"]
word_lengths = {word: len(word) for word in words}
print(word_lengths)
```

```text
{'hello': 5, 'world': 5, 'python': 6}
```

For each `word` in `words`, Python evaluates the key expression (`word`) and the value expression (`len(word)`) and inserts the pair into the new dict. The dict is built fresh — the original list is not modified.

Python also has set comprehensions using `{expression for var in iterable}` — identical to dict comprehensions but without the colon, producing a set of unique values.

## Challenge: even_squares

Write a function `even_squares(limit)` that returns a list of the squares of all even numbers from 2 up to and including `limit`. Use a list comprehension.

`range(2, limit + 1, 2)` generates even numbers from 2 to `limit` inclusive. `range(start, stop, step)` was covered in Level 17.

```challenge
def even_squares(limit):
    pass
```

```test
assert even_squares(10) == [4, 16, 36, 64, 100]
assert even_squares(2) == [4]
assert even_squares(1) == []
assert even_squares(6) == [4, 16, 36]
assert even_squares(0) == []
```
