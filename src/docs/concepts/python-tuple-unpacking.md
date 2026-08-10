# Concept: Tuple Unpacking

**What you'll understand by the end:** how to assign multiple values returned together into separate names in one line, instead of indexing into a returned tuple by position.

**Prerequisites:** none.

## Setup

Python 3, no packages needed.

## The Problem

A function that logically produces two related results (a cleaned value and a piece of metadata about it, for example) needs some way to hand both back to its caller. Returning them bundled together, then accessing each piece by numeric index every time, is workable but harder to read than giving each piece its own name immediately.

## The Isolated Example

```python
def divide_with_remainder(a, b):
    return a // b, a % b

result = divide_with_remainder(17, 5)
print(result, type(result))

quotient, remainder = divide_with_remainder(17, 5)
print(quotient, remainder)
```

**Real output:**
```
(3, 2) <class 'tuple'>
quotient=3 remainder=2
```

**What this proves:** `return a // b, a % b` bundled two values into one real tuple — `result` above shows it as an actual `tuple` object, indexable by position. Writing `quotient, remainder = ...` instead assigned each element directly to its own name in one step, with no manual indexing (`result[0]`, `result[1]`) anywhere.

## Mechanical Walkthrough

- `return a // b, a % b` — a comma between two expressions, with no explicit parentheses, still creates a tuple; parentheses (`return (a // b, a % b)`) are optional here, purely stylistic.
- `quotient, remainder = divide_with_remainder(17, 5)` — the right side evaluates to a two-element tuple; the left side, two comma-separated names, unpacks it positionally: the first name gets the first element, the second gets the second.
- The number of names on the left must match the number of elements on the right, or Python raises a real `ValueError` (`too many values to unpack` / `not enough values to unpack`) rather than silently dropping or leaving something unset.

## CS Lens

This is **destructuring assignment** — binding multiple names at once from a single compound value's structure, rather than one name per statement. The compound value (here, a tuple) is decomposed positionally, each piece bound to a name in the same order it appears in the structure.

Also recognized in: JavaScript's array/object destructuring (`const [a, b] = arr`), and this exact same mechanism is already implicitly at work every time a `for` loop iterates over pairs (`for key, value in dict.items():`) — that's tuple unpacking happening once per loop iteration, not a separate feature.

## SE Lens

The alternative — returning a tuple and always accessing it by index (`result[0]`, `result[1]`) at every call site — works, but forces every reader to remember what position 0 and position 1 mean, with no name attached at the point of use. Unpacking into named variables immediately documents the meaning of each piece right where it's consumed, at zero extra runtime cost — a real, free readability improvement.

## Connection

Directly explains how a function like `strip_comment`, returning a pair of related values (cleaned text and a separately-extracted piece), gets consumed cleanly by its caller in one line rather than two indexed lookups.

## Try It Yourself

1. Call `divide_with_remainder(17, 5)` and unpack it into three names instead of two (`a, b, c = ...`). Read the real `ValueError` this produces, and note exactly what it says about the mismatch.
2. Use the star-unpacking form (`first, *rest = [1, 2, 3, 4]`) to collect "the first item" and "everything else" into two names, one of them a list. Confirm `rest` is a real list, not another tuple.
3. Write a function returning three values instead of two, and unpack all three at once. Then unpack only some of them using an underscore for the ones you don't need (`_, second, third = ...`) — a real, common convention for "I need this position, but not this name" signaling intentional disregard rather than an oversight.
