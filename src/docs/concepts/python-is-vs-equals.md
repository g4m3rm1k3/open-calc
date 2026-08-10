# Concept: `is` vs. `==`

**What you'll understand by the end:** the difference between asking "are these the same object" and "do these have equal values" — two genuinely different questions that happen to agree for simple values and diverge for others.

**Prerequisites:** `mutable-object-aliasing.md`.

## Setup

Python 3, no packages needed.

## The Problem

Two variables can hold values that look identical when printed, while actually referring to two completely separate objects in memory — or they can refer to the literal same object. Code that needs to know specifically *which* of these is true (not just whether the values look equal) needs a different check than the one that compares values.

## The Isolated Example

```python
list_a = [1, 2, 3]
list_b = [1, 2, 3]
list_c = list_a

print("a == b:", list_a == list_b)
print("a is b:", list_a is list_b)
print("a == c:", list_a == list_c)
print("a is c:", list_a is list_c)
```

**Real output:**
```
a == b: True
a is b: False
a == c: True
a is c: True
```

**What this proves:** `list_a` and `list_b` have equal *contents* (`==` is `True`) but are two separate list objects sitting at two different places in memory (`is` is `False`) — mutating one would never affect the other. `list_c = list_a` didn't create a new list at all; it made `list_c` a second name for the *same* object `list_a` already refers to — `is` correctly reports `True`, and mutating through either name would be visible through the other (exactly `mutable-object-aliasing.md`'s trap).

## Mechanical Walkthrough

- `==` calls the object's own equality logic, comparing *values* — for a list, that means comparing every element pairwise; two lists with the same elements in the same order are `==`, regardless of whether they're the same object.
- `is` compares object **identity** — whether both sides are literally the same object in memory, with no value comparison involved at all. Two objects can be `is`-different while being `==`-equal (as `list_a`/`list_b` show), but two objects that are `is`-equal are always also `==`-equal (they're the same object, so of course their values match).
- `list_c = list_a` is an assignment, not a copy — it binds a second name to an existing object rather than constructing a new one.

## CS Lens

This is the distinction between **value equality** and **reference (identity) equality** — a fundamental question every language with mutable, reference-based objects has to answer, and answers with two different operators (or methods) specifically because both questions are genuinely useful, and conflating them would silently lose information.

Also recognized in: Java's `.equals()` (value) versus `==` on objects (reference — the reverse operator assignment from Python's, a real, worth-knowing gotcha if moving between the two languages), JavaScript's `===` (value equality for primitives, reference equality for objects) — every language with both mutable objects and simple values has to draw this same line somewhere, even when the specific syntax differs.

## SE Lens

Using `==` when identity is what actually matters (or `is` when value equality is what's wanted) is a real, common source of subtle bugs — checking `if some_list is []:` to test "is this list empty" is a classic mistake: it's almost always `False`, because the literal `[]` on the right creates a brand-new, distinct empty list object, never the same object as any existing one, no matter what that existing list contains. The correct check for "is this list empty" is `if not some_list:` or `if some_list == []:` — a value question, not an identity question.

## Connection

Builds on `mutable-object-aliasing.md` — `is` is precisely the tool that would have caught that bug immediately (`points_buggy[0] is points_buggy[1]` would have reported `True`, revealing the aliasing at once, before ever inspecting the misleading equal-looking values).

## Try It Yourself

1. Check `some_list is []` for a genuinely empty list you created yourself (`x = []; print(x is [])`). Confirm it's `False`, and explain why, per the SE Lens above.
2. Check `is` between two small integers (`a = 5; b = 5; print(a is b)`) and between two larger ones (`a = 1000; b = 1000; print(a is b)`). Look up Python's small-integer caching behavior to explain why these two cases might disagree — a real, CPython-specific implementation detail worth knowing exists, precisely so you never rely on `is` for comparing numbers.
3. Write a function that takes two lists and returns `True` only if they're both equal in value *and* are genuinely different objects (not aliased) — combining `==` and `not (... is ...)` — a real, useful check for confirming a "copy" function actually copied rather than just returning its input unchanged.
